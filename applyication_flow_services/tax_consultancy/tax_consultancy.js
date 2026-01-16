// tax_consultancy_flow.js - WhatsApp Chatbot Tax Consultancy Flow with API Integration
const axios = require('axios');

class TaxConsultancyFlow {
    constructor() {
        // Tax Consultancy sub-services states
        this.TAX_STATES = {
            TAX_REGISTRATION: 'tax_registration',
            TAX_CLEARANCE_RENEWAL: 'tax_clearance_renewal',
            QUARTERLY_PAYMENT_DATES: 'quarterly_payment_dates',
            FISCALISATION: 'fiscalisation',
            FISCAL_DEVICES: 'fiscal_devices',
            NSSA_REGISTRATION: 'nssa_registration',
            TAX_ADVISORY: 'tax_advisory',
            TAX_HEALTH_CHECK: 'tax_health_check',
            PRICING_INFO: 'pricing_info_tax',
            COLLECT_COMPANY_NAME: 'collect_company_name_tax',
            COLLECT_CONTACT_NAME: 'collect_contact_name_tax',
            COLLECT_EMAIL: 'collect_email_tax',
            COLLECT_PHONE: 'collect_phone_tax',
            CONFIRM_APPLICATION: 'confirm_application_tax',
            TAX_END: 'tax_end'
        };

        // Template IDs for Tax Consultancy sub-services
        this.TAX_TEMPLATES = {
            TAX_REGISTRATION: 'HXf9a543ac7666d9e645b5cd1f892b5110',
            TAX_CLEARANCE_RENEWAL: 'HX089f2c3265662e6074c76dc03a605473',
            QUARTERLY_PAYMENT_DATES: 'HXa9835b1cb7d278241c81b9b5718a1ab5',
            FISCALISATION: 'HXaf89da97b803bdc39f6ad00f495bd394',
            FISCAL_DEVICES: 'HXdc8e4f926f2c95619871973b8358841a',
            NSSA_REGISTRATION: 'HXa263a3355f0f11bd317ea7a3faa72cd1',
            TAX_ADVISORY: 'HX9aee62ae576e4130e15b091961572c30',
            TAX_HEALTH_CHECK: 'HX2cc5f862e54d24ba6552578a03d24ed0'
        };

        // Tax Consultancy sub-services mapping
        this.TAX_SUB_SERVICES = {
            'Tax Registration': {
                templateId: this.TAX_TEMPLATES.TAX_REGISTRATION,
                state: this.TAX_STATES.TAX_REGISTRATION,
                description: 'Register your business for tax compliance with ZIMRA'
            },
            'Tax Clearance Renewal': {
                templateId: this.TAX_TEMPLATES.TAX_CLEARANCE_RENEWAL,
                state: this.TAX_STATES.TAX_CLEARANCE_RENEWAL,
                description: 'Renew your tax clearance certificate'
            },
            'Quarterly Payment Dates': {
                templateId: this.TAX_TEMPLATES.QUARTERLY_PAYMENT_DATES,
                state: this.TAX_STATES.QUARTERLY_PAYMENT_DATES,
                description: 'Get reminders and assistance with quarterly tax payments'
            },
            'Fiscalisation': {
                templateId: this.TAX_TEMPLATES.FISCALISATION,
                state: this.TAX_STATES.FISCALISATION,
                description: 'Fiscal device installation and compliance services'
            },
            'Fiscal Devices': {
                templateId: this.TAX_TEMPLATES.FISCAL_DEVICES,
                state: this.TAX_STATES.FISCAL_DEVICES,
                description: 'Supply, installation, and maintenance of fiscal devices'
            },
            'NSSA Registration': {
                templateId: this.TAX_TEMPLATES.NSSA_REGISTRATION,
                state: this.TAX_STATES.NSSA_REGISTRATION,
                description: 'Register your employees with NSSA for social security'
            },
            'Tax Advisory': {
                templateId: this.TAX_TEMPLATES.TAX_ADVISORY,
                state: this.TAX_STATES.TAX_ADVISORY,
                description: 'Expert tax advice and planning services'
            },
            'Tax Health Check': {
                templateId: this.TAX_TEMPLATES.TAX_HEALTH_CHECK,
                state: this.TAX_STATES.TAX_HEALTH_CHECK,
                description: 'Comprehensive review of your tax compliance status'
            }
        };

        // Pricing information for each service
        this.PRICING = {
            'Tax Registration': {
                'Basic Registration': '$150',
                'Express Service': '$300',
                'Complete Package': '$500'
            },
            'Tax Clearance Renewal': {
                'Standard Renewal': '$100',
                'Express Processing': '$200',
                'Compliance Check Included': '$350'
            },
            'Quarterly Payment Dates': {
                'Basic Reminder Service': '$50/month',
                'Full Compliance Management': '$150/month',
                'Annual Package': '$1200/year'
            },
            'Fiscalisation': {
                'Device Installation': '$200',
                'Compliance Setup': '$400',
                'Ongoing Support': '$100/month'
            },
            'Fiscal Devices': {
                'Device Rental': '$50/month',
                'Device Purchase': '$800',
                'Maintenance Contract': '$100/month'
            },
            'NSSA Registration': {
                'Basic Registration': '$100',
                'Employee Setup (up to 10)': '$250',
                'Complete HR Package': '$500'
            },
            'Tax Advisory': {
                'Consultation (1 hour)': '$150',
                'Monthly Retainer': '$500/month',
                'Annual Tax Planning': '$2000'
            },
            'Tax Health Check': {
                'Basic Review': '$300',
                'Comprehensive Audit': '$800',
                'Full Compliance Report': '$1200'
            }
        };

        // Required documents for each service
        this.REQUIRED_DOCUMENTS = {
            'Tax Registration': [
                'Business registration certificate',
                'Director(s) ID copies',
                'Proof of address',
                'Bank statement'
            ],
            'Tax Clearance Renewal': [
                'Previous tax clearance certificate',
                'Recent financial statements',
                'Tax returns for previous year'
            ],
            'NSSA Registration': [
                'Company registration documents',
                'Employee details and IDs',
                'Business bank details'
            ]
        };

        // API base URL
        this.API_BASE_URL = 'https://echolar-admin-final.onrender.com/api/v1';

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] TAX_CONSULTANCY_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Check if current state is a tax consultancy state
    isTaxState(state) {
        return Object.values(this.TAX_STATES).includes(state);
    }

    // Start tax sub-service
    startTaxSubService(session, phoneNumber, subServiceName) {
        const subService = this.TAX_SUB_SERVICES[subServiceName];
        
        if (subService) {
            session.state = subService.state;
            session.selectedSubService = subServiceName;
            session.taxData = session.taxData || {};
            session.taxData.startTime = new Date().toISOString();
            
            this.debug('Starting tax sub-service', {
                phoneNumber,
                subService: subServiceName,
                state: subService.state,
                templateId: subService.templateId
            });

            // Return the template for the selected sub-service
            return {
                type: 'template',
                templateSid: subService.templateId,
                variables: {}
            };
        }

        return {
            type: 'message',
            content: `❌ Invalid tax service selection. Please choose from the available options.`
        };
    }

    // Show pricing information for the selected service
    showPricingInformation(session) {
        const serviceName = session.selectedSubService;
        const pricing = this.PRICING[serviceName];

        if (!pricing) {
            return {
                type: 'message',
                content: `❌ Pricing information not available for ${serviceName}. Please contact us for details.`
            };
        }

        let message = `💰 *Pricing for ${serviceName}*\n\n`;

        for (const [plan, price] of Object.entries(pricing)) {
            message += `• ${plan}: ${price}\n`;
        }

        // Show required documents if available
        const requiredDocs = this.REQUIRED_DOCUMENTS[serviceName];
        if (requiredDocs) {
            message += `\n📋 *Required Documents:*\n`;
            requiredDocs.forEach(doc => {
                message += `• ${doc}\n`;
            });
        }

        message += `\n✅ Type 'proceed' to start application\n`;
        message += `📋 Type 'documents' to see required documents\n`;
        message += `↩️ Type 'back' to choose a different service\n`;
        message += `🏠 Type 'menu' for main menu`;

        return {
            type: 'message',
            content: message
        };
    }

    // Show detailed documents requirement
    showDocumentsRequirement(session) {
        const serviceName = session.selectedSubService;
        const requiredDocs = this.REQUIRED_DOCUMENTS[serviceName];

        if (!requiredDocs || requiredDocs.length === 0) {
            return {
                type: 'message',
                content: `📋 *${serviceName}*\n\nNo specific documents required. We'll guide you through the process.\n\n✅ Type 'proceed' to continue`
            };
        }

        let message = `📋 *Required Documents for ${serviceName}*\n\n`;
        
        requiredDocs.forEach((doc, index) => {
            message += `${index + 1}. ${doc}\n`;
        });

        message += `\n💡 *Tips:*\n`;
        message += `• Have digital copies ready for upload\n`;
        message += `• Ensure documents are clear and readable\n`;
        message += `• Original documents may be required for verification\n`;
        message += `\n✅ Type 'proceed' to start application\n`;
        message += `↩️ Type 'back' to return to pricing`;

        return {
            type: 'message',
            content: message
        };
    }

    // Process tax consultancy input
    async processTaxInput(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();
        this.debug('Processing tax input', {
            phoneNumber,
            currentState: session.state,
            userInput,
            originalMessage: message
        });

        // Handle "Apply selected" or "proceed" to start application
        if ((userInput === 'proceed' || userInput === 'apply') && 
            this.isTaxState(session.state) && 
            session.state !== this.TAX_STATES.COLLECT_COMPANY_NAME) {
            
            session.state = this.TAX_STATES.COLLECT_COMPANY_NAME;
            session.taxData = session.taxData || {};
            this.debug('Tax application started', { phoneNumber });

            return {
                type: 'message',
                content: `📋 You've selected to apply for *${session.selectedSubService}*.\n\nLet's collect some information to process your application.\n\nPlease provide your *Company Name*:`
            };
        }

        // Handle documents request
        if (userInput === 'documents' && this.isTaxState(session.state)) {
            return this.showDocumentsRequirement(session);
        }

        // Handle application data collection
        switch (session.state) {
            case this.TAX_STATES.COLLECT_COMPANY_NAME:
                session.taxData.companyName = message.trim();
                session.state = this.TAX_STATES.COLLECT_CONTACT_NAME;
                return {
                    type: 'message',
                    content: `✅ Thank you! Now please provide your *Full Name*:`
                };
                
            case this.TAX_STATES.COLLECT_CONTACT_NAME:
                session.taxData.contactName = message.trim();
                session.state = this.TAX_STATES.COLLECT_EMAIL;
                return {
                    type: 'message',
                    content: `👤 Great! Now please provide your *Email Address*:`
                };
                
            case this.TAX_STATES.COLLECT_EMAIL:
                // Validate email format
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(userInput)) {
                    return {
                        type: 'message',
                        content: `❌ Invalid email format. Please provide a valid email address:`
                    };
                }
                session.taxData.email = userInput.toLowerCase();
                session.state = this.TAX_STATES.COLLECT_PHONE;
                return {
                    type: 'message',
                    content: `📧 Perfect! Finally, please provide your *Phone Number*:`
                };
                
            case this.TAX_STATES.COLLECT_PHONE:
                session.taxData.phoneNumber = message.trim();
                session.state = this.TAX_STATES.CONFIRM_APPLICATION;
                
                // Format application summary
                const summary = this.generateTaxApplicationSummary(session);
                
                return {
                    type: 'message',
                    content: summary
                };
                
            case this.TAX_STATES.CONFIRM_APPLICATION:
                if (userInput === 'confirm') {
                    // Create application via API call
                    try {
                        const applicationResult = await this.createTaxApplicationViaAPI(session, phoneNumber);
                        
                        if (applicationResult.success) {
                            session.state = this.TAX_STATES.TAX_END;
                            session.taxData.applicationId = applicationResult.applicationId;
                            session.taxData.referenceNumber = applicationResult.referenceNumber;
                            
                            return {
                                type: 'message',
                                content: this.generateSuccessMessage(session, applicationResult)
                            };
                        } else {
                            this.debug('API call failed', applicationResult);
                            return {
                                type: 'message',
                                content: `❌ Error creating application: ${applicationResult.message}\n\n🔄 Type 'retry' to try again or 'back' to modify information.`
                            };
                        }
                    } catch (error) {
                        this.debug('Error creating application via API', error);
                        return {
                            type: 'message',
                            content: `❌ Error creating application. Please try again or contact support.\n\n🔄 Type 'retry' to try again.`
                        };
                    }
                } else if (userInput === 'cancel' || userInput === 'back') {
                    session.state = this.TAX_STATES.PRICING_INFO;
                    session.taxData = {};
                    return this.showPricingInformation(session);
                } else if (userInput === 'retry') {
                    // Try to create application again
                    try {
                        const applicationResult = await this.createTaxApplicationViaAPI(session, phoneNumber);
                        
                        if (applicationResult.success) {
                            session.state = this.TAX_STATES.TAX_END;
                            session.taxData.applicationId = applicationResult.applicationId;
                            session.taxData.referenceNumber = applicationResult.referenceNumber;
                            
                            return {
                                type: 'message',
                                content: `✅ *Application Submitted Successfully!*\n\nReference: ${applicationResult.referenceNumber || 'Pending'}\n\nType 'menu' to return to the main menu.`
                            };
                        } else {
                            return {
                                type: 'message',
                                content: `❌ Error creating application: ${applicationResult.message}\n\nPlease contact support for assistance.`
                            };
                        }
                    } catch (error) {
                        this.debug('Retry failed', error);
                        return {
                            type: 'message',
                            content: `❌ Error persists. Please contact support for assistance.`
                        };
                    }
                } else {
                    const summary = this.generateTaxApplicationSummary(session);
                    return {
                        type: 'message',
                        content: summary
                    };
                }
        }

        // Handle navigation commands
        if (userInput === 'back') {
            return this.handleBackNavigation(session);
        }

        if (userInput === 'menu') {
            return this.handleMenuNavigation(session);
        }

        if (userInput === 'help') {
            return this.showHelp(session);
        }

        // Default response for tax states - show pricing or service info
        if (this.isTaxState(session.state) && session.selectedSubService) {
            return this.showPricingInformation(session);
        }

        return {
            type: 'message',
            content: `📋 You're in the *Tax Consultancy* section.\n\nPlease use the interactive buttons or:\n• Type 'proceed' to start application\n• Type 'back' to return to tax services\n• Type 'menu' for main menu\n• Type 'help' for assistance`
        };
    }

    // Generate tax application summary
    generateTaxApplicationSummary(session) {
        const serviceName = session.selectedSubService;
        const data = session.taxData;
        
        let summary = `📋 *Please Confirm Your Tax Application Details*\n\n`;
        summary += `🔹 *Service:* ${serviceName}\n`;
        summary += `🔹 *Company Name:* ${data.companyName}\n`;
        summary += `🔹 *Contact Name:* ${data.contactName}\n`;
        summary += `🔹 *Email:* ${data.email}\n`;
        summary += `🔹 *Phone:* ${data.phoneNumber}\n\n`;
        
        // Add service-specific information
        const pricing = this.PRICING[serviceName];
        if (pricing) {
            summary += `💰 *Pricing Options:*\n`;
            for (const [plan, price] of Object.entries(pricing)) {
                summary += `• ${plan}: ${price}\n`;
            }
            summary += `\n`;
        }
        
        summary += `✅ Type 'confirm' to submit your application\n`;
        summary += `✏️ Type 'back' to modify information\n`;
        summary += `❌ Type 'cancel' to cancel application`;

        return summary;
    }

    // Generate success message
    generateSuccessMessage(session, applicationResult) {
        const serviceName = session.selectedSubService;
        const data = session.taxData;
        
        let message = `✅ *Tax Application Submitted Successfully!*\n\n`;
        message += `📋 **Application Details:**\n`;
        message += `• Service: ${serviceName}\n`;
        message += `• Company: ${data.companyName}\n`;
        message += `• Contact: ${data.contactName}\n`;
        message += `• Reference: ${applicationResult.referenceNumber || 'Pending'}\n`;
        message += `• Application ID: ${applicationResult.applicationId || 'N/A'}\n\n`;
        
        message += `📞 *Next Steps:*\n`;
        message += `• Our tax specialists will contact you within 24 hours\n`;
        message += `• We'll reach you at ${data.phoneNumber} or ${data.email}\n`;
        message += `• Prepare the required documents for verification\n`;
        message += `• Estimated processing time: 3-5 business days\n\n`;
        
        message += `💼 *Need immediate assistance?*\n`;
        message += `Call our tax department: +263 772 123 456\n\n`;
        
        message += `🔄 Type 'menu' to return to main menu or 'back' for more tax services`;

        return message;
    }

    // Handle back navigation
    handleBackNavigation(session) {
        if (session.state === this.TAX_STATES.COLLECT_COMPANY_NAME || 
            session.state === this.TAX_STATES.COLLECT_CONTACT_NAME ||
            session.state === this.TAX_STATES.COLLECT_EMAIL ||
            session.state === this.TAX_STATES.COLLECT_PHONE) {
            
            session.state = this.TAX_STATES.PRICING_INFO;
            return this.showPricingInformation(session);
        }
        
        // Go back to tax main menu
        session.state = 'tax_consultancy';
        session.selectedSubService = null;
        session.taxData = {};
        
        return {
            type: 'template',
            templateSid: 'HX4dfa2cdc77dc9b6e1caebbde44d371c4', // Tax consultancy main template
            variables: {}
        };
    }

    // Handle menu navigation
    handleMenuNavigation(session) {
        session.state = 'main_menu';
        session.selectedService = null;
        session.selectedSubService = null;
        session.taxData = {};
        
        return {
            type: 'template',
            templateSid: 'HX1709f2dbf88a5e5cf077a618ada6a8e0', // Main menu template
            variables: {}
        };
    }

    // Show help information
    showHelp(session) {
        const serviceName = session.selectedSubService || 'Tax Consultancy';
        
        return {
            type: 'message',
            content: `🆘 *Help - ${serviceName}*\n\nAvailable commands:\n• 'proceed' - Start application process\n• 'documents' - View required documents\n• 'back' - Go to previous step\n• 'menu' - Return to main menu\n• 'help' - Show this help\n\nCurrent stage: ${session.state}`
        };
    }

    // Create tax application via API call
    async createTaxApplicationViaAPI(session, phoneNumber) {
        try {
            // Prepare application data for API
            const applicationData = {
                companyName: session.taxData.companyName || 'Not provided',
                email: session.taxData.email || 'Not provided',
                contactName: session.taxData.contactName || 'Not provided',
                phoneNumber: session.taxData.phoneNumber || 'Not provided',
                serviceType: session.selectedSubService || 'Tax Consultancy Service',
                subServiceType: session.selectedSubService,
                status: 'Pending',
                whatsappNumber: phoneNumber,
                applicationDate: new Date().toISOString(),
                pricingInfo: this.PRICING[session.selectedSubService] || {},
                requiredDocuments: this.REQUIRED_DOCUMENTS[session.selectedSubService] || [],
                flowType: 'tax_consultancy',
                flowSessionData: {
                    taxData: session.taxData,
                    selectedService: session.selectedService,
                    selectedSubService: session.selectedSubService
                }
            };
            
            this.debug('Calling API to create tax application', {
                url: `${this.API_BASE_URL}/universal-applications`,
                data: applicationData
            });
            
            // Make API call to your universal applications endpoint
            const response = await axios.post(`${this.API_BASE_URL}/universal-applications`, applicationData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });
            
            if (response.data.success) {
                this.debug('Tax application created successfully via API', {
                    applicationId: response.data.data._id,
                    referenceNumber: response.data.data.referenceNumber
                });
                
                return {
                    success: true,
                    applicationId: response.data.data._id,
                    referenceNumber: response.data.data.referenceNumber || 'N/A',
                    message: 'Tax application created successfully'
                };
            } else {
                this.debug('API returned error', response.data);
                return {
                    success: false,
                    message: response.data.message || 'Failed to create tax application'
                };
            }
            
        } catch (error) {
            this.debug('API call failed', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                return {
                    success: false,
                    message: 'Cannot connect to application service. Please try again later.'
                };
            }
            
            if (error.response) {
                return {
                    success: false,
                    message: error.response.data?.message || 'API error occurred'
                };
            }
            
            return {
                success: false,
                message: error.message || 'Unknown error occurred'
            };
        }
    }

    // Get tax summary for admin/debugging
    getTaxSummary(session) {
        if (!this.isTaxState(session.state)) return null;

        return {
            currentService: session.selectedSubService || 'Tax Consultancy Service',
            currentState: session.state,
            taxData: session.taxData || {},
            applicationId: session.taxData?.applicationId || 'Not created',
            referenceNumber: session.taxData?.referenceNumber || 'Not assigned',
            pricingInfo: this.PRICING[session.selectedSubService] || {},
            requiredDocuments: this.REQUIRED_DOCUMENTS[session.selectedSubService] || []
        };
    }

    // Calculate progress through tax flow
    calculateProgress(session) {
        if (!this.isTaxState(session.state)) return 0;

        const stateProgress = {
            [this.TAX_STATES.TAX_REGISTRATION]: 10,
            [this.TAX_STATES.TAX_CLEARANCE_RENEWAL]: 10,
            [this.TAX_STATES.QUARTERLY_PAYMENT_DATES]: 10,
            [this.TAX_STATES.FISCALISATION]: 10,
            [this.TAX_STATES.FISCAL_DEVICES]: 10,
            [this.TAX_STATES.NSSA_REGISTRATION]: 10,
            [this.TAX_STATES.TAX_ADVISORY]: 10,
            [this.TAX_STATES.TAX_HEALTH_CHECK]: 10,
            [this.TAX_STATES.PRICING_INFO]: 20,
            [this.TAX_STATES.COLLECT_COMPANY_NAME]: 40,
            [this.TAX_STATES.COLLECT_CONTACT_NAME]: 60,
            [this.TAX_STATES.COLLECT_EMAIL]: 80,
            [this.TAX_STATES.COLLECT_PHONE]: 90,
            [this.TAX_STATES.CONFIRM_APPLICATION]: 95,
            [this.TAX_STATES.TAX_END]: 100
        };

        return stateProgress[session.state] || 0;
    }
}

module.exports = TaxConsultancyFlow;