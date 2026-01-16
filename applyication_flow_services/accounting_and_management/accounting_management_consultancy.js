// accounting_management_flow.js - Accounting & Management Services Flow (Updated with Application Process)
const axios = require('axios');

class AccountingManagementFlow {
    constructor() {
        // Accounting & Management sub-services states
        this.ACCOUNTING_STATES = {
            BOOKKEEPING: 'bookkeeping',
            PAYROLL: 'payroll',
            BUSINESS_VALUATIONS: 'business_valuations',
            DUE_DILIGENCE: 'due_diligence',
            DIVIDEND_CERTIFICATES: 'dividend_certificates',
            PRICING_INFO: 'pricing_info',
            COLLECT_COMPANY_NAME: 'collect_company_name_accounting',
            COLLECT_CONTACT_NAME: 'collect_contact_name_accounting',
            COLLECT_EMAIL: 'collect_email_accounting',
            COLLECT_PHONE: 'collect_phone_accounting',
            CONFIRM_APPLICATION: 'confirm_application_accounting',
            ACCOUNTING_END: 'accounting_end'
        };

        // Template IDs for Accounting sub-services based on your requirements
        this.ACCOUNTING_TEMPLATES = {
            BOOKKEEPING: 'HXaff16f68efc691668fa4829b7e7b63ef',
            PAYROLL: 'HX30c4425ff93ac13f8f762bb50413888e',
            BUSINESS_VALUATIONS: 'HX8da61dca2ef5ce8381381ac9c549d3bd',
            DUE_DILIGENCE: 'HX3af01d2a33262e012729490ca6b768ba',
            DIVIDEND_CERTIFICATES: 'HXe687dcf68aef4ce312d0531e60823c40'
        };

        // Accounting sub-services mapping with exact item IDs from your template
        this.ACCOUNTING_SUB_SERVICES = {
            'Book-keeping Services': {
                templateId: this.ACCOUNTING_TEMPLATES.BOOKKEEPING,
                state: this.ACCOUNTING_STATES.BOOKKEEPING
            },
            'Payroll Outsourcing': {
                templateId: this.ACCOUNTING_TEMPLATES.PAYROLL,
                state: this.ACCOUNTING_STATES.PAYROLL
            },
            'Business Valuations': {
                templateId: this.ACCOUNTING_TEMPLATES.BUSINESS_VALUATIONS,
                state: this.ACCOUNTING_STATES.BUSINESS_VALUATIONS
            },
            'Due Diligence': {
                templateId: this.ACCOUNTING_TEMPLATES.DUE_DILIGENCE,
                state: this.ACCOUNTING_STATES.DUE_DILIGENCE
            },
            'Dividend Certificates': {
                templateId: this.ACCOUNTING_TEMPLATES.DIVIDEND_CERTIFICATES,
                state: this.ACCOUNTING_STATES.DIVIDEND_CERTIFICATES
            }
        };

        // Pricing information for accounting services
        this.PRICING = {
            'Book-keeping Services': {
                'Basic Package': '$150/month',
                'Standard Package': '$300/month',
                'Premium Package': '$500/month'
            },
            'Payroll Outsourcing': {
                'Up to 10 employees': '$100/month',
                '11-25 employees': '$200/month',
                '26-50 employees': '$350/month',
                'Custom Quote': 'Contact for pricing'
            },
            'Business Valuations': {
                'Small Business': '$1,000 - $2,500',
                'Medium Business': '$2,500 - $5,000',
                'Large Business': 'Custom quote based on complexity'
            },
            'Due Diligence': {
                'Basic Review': '$1,500 - $3,000',
                'Comprehensive Review': '$3,000 - $7,000',
                'Enterprise Level': 'Custom quote based on scope'
            },
            'Dividend Certificates': {
                'Per Certificate': '$50',
                'Bulk (10+)': '$40 each',
                'Annual Service': 'Contact for package pricing'
            }
        };

        // API base URL - configure this based on your environment
        this.API_BASE_URL = 'https://echolar-admin-final.onrender.com/api/v1';

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ACCOUNTING_MANAGEMENT_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Check if current state is an Accounting management state
    isAccountingState(state) {
        return Object.values(this.ACCOUNTING_STATES).includes(state);
    }

    // Start Accounting sub-service based on the selected item from main template
    startAccountingSubService(session, phoneNumber, subServiceName) {
        const subService = this.ACCOUNTING_SUB_SERVICES[subServiceName];
        
        if (subService) {
            session.state = subService.state;
            session.selectedSubService = subServiceName;
            
            // Initialize accounting data if not exists
            if (!session.accountingData) {
                session.accountingData = {
                    startTime: new Date().toISOString(),
                    selectedService: subServiceName,
                    progress: 'started'
                };
            }
            
            this.debug('Starting Accounting sub-service', {
                phoneNumber,
                subService: subServiceName,
                state: subService.state,
                templateId: subService.templateId
            });

            return {
                type: 'template',
                templateSid: subService.templateId,
                variables: {}
            };
        }

        return {
            type: 'message',
            content: `❌ Invalid Accounting service selection. Please choose from the available options.`
        };
    }

    // Process Accounting management input
    async processAccountingInput(message, session, phoneNumber) {
        const userInput = message.trim();
        this.debug('Processing Accounting input', {
            phoneNumber,
            currentState: session.state,
            userInput,
            originalMessage: message
        });

        // Handle "Apply" button from any Accounting sub-service template
        if ((userInput.toLowerCase() === 'apply' || userInput.toLowerCase() === 'apply selected') && 
            Object.values(this.ACCOUNTING_STATES).includes(session.state) &&
            session.state !== this.ACCOUNTING_STATES.PRICING_INFO) {
            
            session.state = this.ACCOUNTING_STATES.PRICING_INFO;
            this.debug('Accounting application started', { 
                phoneNumber, 
                service: session.selectedSubService 
            });

            return this.showPricingInformation(session);
        }

        // Handle "proceed" to start application after pricing
        if ((userInput.toLowerCase() === 'proceed' || userInput.toLowerCase() === 'apply') && 
            session.state === this.ACCOUNTING_STATES.PRICING_INFO) {
            
            session.state = this.ACCOUNTING_STATES.COLLECT_COMPANY_NAME;
            this.debug('Accounting application data collection started', { phoneNumber });

            return {
                type: 'message',
                content: `📋 You've selected to apply for *${session.selectedSubService}*.\n\nLet's collect some information to process your application.\n\nPlease provide your *Company Name*:`
            };
        }

        // Handle application data collection
        switch (session.state) {
            case this.ACCOUNTING_STATES.COLLECT_COMPANY_NAME:
                session.accountingData.companyName = userInput;
                session.state = this.ACCOUNTING_STATES.COLLECT_CONTACT_NAME;
                return {
                    type: 'message',
                    content: `Thank you! Now please provide your *Full Name*:`
                };
                
            case this.ACCOUNTING_STATES.COLLECT_CONTACT_NAME:
                session.accountingData.contactName = userInput;
                session.state = this.ACCOUNTING_STATES.COLLECT_EMAIL;
                return {
                    type: 'message',
                    content: `Great! Now please provide your *Email Address*:`
                };
                
            case this.ACCOUNTING_STATES.COLLECT_EMAIL:
                // Validate email format
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(userInput)) {
                    return {
                        type: 'message',
                        content: `❌ Invalid email format. Please provide a valid email address:`
                    };
                }
                session.accountingData.email = userInput.toLowerCase();
                session.state = this.ACCOUNTING_STATES.COLLECT_PHONE;
                return {
                    type: 'message',
                    content: `Perfect! Finally, please provide your *Phone Number*:`
                };
                
            case this.ACCOUNTING_STATES.COLLECT_PHONE:
                session.accountingData.phoneNumber = userInput;
                session.state = this.ACCOUNTING_STATES.CONFIRM_APPLICATION;
                
                // Format application summary
                const summary = `
📋 *Application Summary*

*Service:* ${session.selectedSubService}
*Company Name:* ${session.accountingData.companyName}
*Contact Name:* ${session.accountingData.contactName}
*Email:* ${session.accountingData.email}
*Phone:* ${session.accountingData.phoneNumber}

Please confirm if this information is correct by typing 'confirm' to submit your application, or 'cancel' to start over.
                `;
                
                return {
                    type: 'message',
                    content: summary
                };
                
            case this.ACCOUNTING_STATES.CONFIRM_APPLICATION:
                if (userInput.toLowerCase() === 'confirm') {
                    // Create application via API call
                    try {
                        const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                        
                        if (applicationResult.success) {
                            session.state = this.ACCOUNTING_STATES.ACCOUNTING_END;
                            session.accountingData.applicationId = applicationResult.applicationId;
                            
                            return {
                                type: 'message',
                                content: `✅ *Application Submitted Successfully!*\n\n📋 **Application Details:**\n• Service: ${session.selectedSubService}\n• Company: ${session.accountingData.companyName}\n• Contact: ${session.accountingData.contactName}\n• Reference: ${applicationResult.referenceNumber || 'Pending'}\n\nThank you for your application. Our accounting specialists will contact you within 24 hours at ${session.accountingData.phoneNumber} or ${session.accountingData.email} to discuss your requirements.\n\nType 'menu' to return to the main menu or 'back' to return to Accounting services.`
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
                } else if (userInput.toLowerCase() === 'cancel') {
                    session.state = this.ACCOUNTING_STATES.PRICING_INFO;
                    session.accountingData = {
                        startTime: new Date().toISOString(),
                        selectedService: session.selectedSubService,
                        progress: 'restarted'
                    };
                    return this.showPricingInformation(session);
                } else if (userInput.toLowerCase() === 'retry') {
                    // Try to create application again
                    try {
                        const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                        
                        if (applicationResult.success) {
                            session.state = this.ACCOUNTING_STATES.ACCOUNTING_END;
                            session.accountingData.applicationId = applicationResult.applicationId;
                            
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
                    return {
                        type: 'message',
                        content: `Please type 'confirm' to submit your application or 'cancel' to start over.`
                    };
                }
        }

        // Handle navigation commands
        if (userInput.toLowerCase() === 'back') {
            // Go back to Accounting main menu
            session.state = 'accounting_management'; // Main Accounting state
            session.selectedSubService = null;
            session.accountingData = null;
            
            return {
                type: 'template',
                templateSid: 'HX168e6d2f02789f825a371b58125b87be', // Accounting main template
                variables: {}
            };
        }

        if (userInput.toLowerCase() === 'menu') {
            // Go to main menu
            session.state = 'main_menu';
            session.selectedService = null;
            session.selectedSubService = null;
            session.accountingData = null;
            
            return {
                type: 'template',
                templateSid: 'HX1709f2dbf88a5e5cf077a618ada6a8e0', // Main menu template
                variables: {}
            };
        }

        // Default response for Accounting states
        const serviceName = session.selectedSubService || 'Accounting Service';
        return {
            type: 'message',
            content: `📋 You're in the *${serviceName}* section.\n\nPlease use the interactive buttons or:\n• Type 'proceed' to start application\n• Type 'back' to return to Accounting services\n• Type 'menu' for main menu\n• Type 'help' for assistance`
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

        message += `\n✅ Type 'proceed' to continue with application\n`;
        message += `↩️ Type 'back' to choose a different service\n`;
        message += `🏠 Type 'menu' for main menu`;

        return {
            type: 'message',
            content: message
        };
    }

    // Create application via API call
    async createApplicationViaAPI(session, phoneNumber) {
        try {
            // Prepare application data for API - mapping to your UniversalApply model
            const applicationData = {
                companyName: session.accountingData.companyName || 'Not provided',
                email: session.accountingData.email || 'Not provided',
                contactName: session.accountingData.contactName || 'Not provided',
                phoneNumber: session.accountingData.phoneNumber || 'Not provided',
                serviceType: session.selectedSubService || 'Accounting Service',
                status: 'Pending',
                whatsappNumber: phoneNumber,
                applicationDate: new Date().toISOString(),
                pricingInfo: this.PRICING[session.selectedSubService] || {},
                flowSessionData: session.accountingData // Store complete session data for reference
            };
            
            this.debug('Calling API to create accounting application', {
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
                this.debug('Accounting application created successfully via API', {
                    applicationId: response.data.data._id,
                    referenceNumber: response.data.data.referenceNumber
                });
                
                return {
                    success: true,
                    applicationId: response.data.data._id,
                    referenceNumber: response.data.data.referenceNumber || 'N/A',
                    message: 'Application created successfully'
                };
            } else {
                this.debug('API returned error', response.data);
                return {
                    success: false,
                    message: response.data.message || 'Failed to create application'
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
                    message: 'Cannot connect to application service'
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

    // Get Accounting summary for admin/debugging
    getAccountingSummary(session) {
        if (!this.isAccountingState(session.state)) return null;

        return {
            currentService: session.selectedSubService || 'Accounting Service',
            currentState: session.state,
            applicationData: session.accountingData || {},
            applicationId: session.accountingData?.applicationId || 'Not created',
            pricingInfo: this.PRICING[session.selectedSubService] || {}
        };
    }

    // Calculate progress through Accounting flow
    calculateProgress(session) {
        if (!this.isAccountingState(session.state)) return 0;

        const stateProgress = {
            [this.ACCOUNTING_STATES.BOOKKEEPING]: 10,
            [this.ACCOUNTING_STATES.PAYROLL]: 10,
            [this.ACCOUNTING_STATES.BUSINESS_VALUATIONS]: 10,
            [this.ACCOUNTING_STATES.DUE_DILIGENCE]: 10,
            [this.ACCOUNTING_STATES.DIVIDEND_CERTIFICATES]: 10,
            [this.ACCOUNTING_STATES.PRICING_INFO]: 20,
            [this.ACCOUNTING_STATES.COLLECT_COMPANY_NAME]: 40,
            [this.ACCOUNTING_STATES.COLLECT_CONTACT_NAME]: 60,
            [this.ACCOUNTING_STATES.COLLECT_EMAIL]: 80,
            [this.ACCOUNTING_STATES.COLLECT_PHONE]: 90,
            [this.ACCOUNTING_STATES.CONFIRM_APPLICATION]: 95,
            [this.ACCOUNTING_STATES.ACCOUNTING_END]: 100
        };

        return stateProgress[session.state] || 0;
    }

    // Reset accounting session data
    resetAccountingSession(session) {
        session.accountingData = null;
        session.selectedSubService = null;
        this.debug('Accounting session reset');
    }
}

module.exports = AccountingManagementFlow;