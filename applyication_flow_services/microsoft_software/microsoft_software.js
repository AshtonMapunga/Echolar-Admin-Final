// microsoft_software_flow.js - WhatsApp Chatbot Microsoft Software Flow
const axios = require('axios');

class MicrosoftSoftwareFlow {
    constructor() {
        // Microsoft Software sub-services states
        this.MICROSOFT_SOFTWARE_STATES = {
            MICROSOFT_EXCEL: 'microsoft_excel',
            OFFICE_365_COPILOT: 'office_365_copilot',
            EMAIL_SERVER: 'email_server',
            PRICING_INFO: 'pricing_info_microsoft',
            COLLECT_COMPANY_NAME: 'collect_company_name_microsoft',
            COLLECT_CONTACT_NAME: 'collect_contact_name_microsoft',
            COLLECT_EMAIL: 'collect_email_microsoft',
            COLLECT_PHONE: 'collect_phone_microsoft',
            CONFIRM_APPLICATION: 'confirm_application_microsoft',
            MICROSOFT_SOFTWARE_END: 'microsoft_software_end'
        };

        // Template IDs for Microsoft services
        this.TEMPLATE_IDS = {
            'Microsoft Excel': 'HX434da9d17a1d3ce040d235694e20cef5',
            '365 Copilot': 'HX6cd0df07897dd98a7fea41ab4ef9b29d',
            'Email Server': 'HX12894b844ce32feb25f767fc69ce94bf'
        };

        // Pricing information for Microsoft services
        this.PRICING = {
            'Microsoft Excel': {
                'Single License': '$150',
                'Business Package (5 licenses)': '$600',
                'Enterprise Package': 'Contact for pricing'
            },
            '365 Copilot': {
                'Per User/Month': '$30',
                'Annual Subscription (per user)': '$300',
                'Business Package (10+ users)': 'Contact for discount'
            },
            'Email Server': {
                'Basic Setup': '$500',
                'Standard (up to 50 users)': '$1000',
                'Enterprise (unlimited users)': '$2500+',
                'Monthly Maintenance': '$100'
            }
        };

        // API base URL - configure this based on your environment
        this.API_BASE_URL = process.env.API_BASE_URL || 'https://your-api-domain.com/api/v1';

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] MICROSOFT_SOFTWARE_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Check if current state is a Microsoft software state
    isMicrosoftSoftwareState(state) {
        return Object.values(this.MICROSOFT_SOFTWARE_STATES).includes(state);
    }

    // Start Microsoft software sub-service
    startMicrosoftSoftwareSubService(session, phoneNumber, subServiceName) {
        session.selectedSubService = subServiceName;
        session.state = this.MICROSOFT_SOFTWARE_STATES.PRICING_INFO;
        session.applicationData = {}; // Initialize application data
        
        this.debug('Starting Microsoft Software sub-service', {
            phoneNumber,
            subService: subServiceName,
            state: session.state
        });

        return this.showPricingInformation(session);
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

    // Process Microsoft software input
    async processMicrosoftSoftwareInput(message, session, phoneNumber) {
        const userInput = message.trim();
        this.debug('Processing Microsoft Software input', {
            phoneNumber,
            currentState: session.state,
            userInput,
            originalMessage: message
        });

        // Handle "Apply selected" or "proceed" to start application
        if ((userInput.toLowerCase() === 'proceed' || userInput.toLowerCase() === 'apply') && 
            session.state === this.MICROSOFT_SOFTWARE_STATES.PRICING_INFO) {
            
            session.state = this.MICROSOFT_SOFTWARE_STATES.COLLECT_COMPANY_NAME;
            this.debug('Microsoft Software application started', { phoneNumber });

            return {
                type: 'message',
                content: `📋 You've selected to apply for *${session.selectedSubService}*.\n\nLet's collect some information to process your application.\n\nPlease provide your *Company Name*:`
            };
        }

        // Handle application data collection
        switch (session.state) {
            case this.MICROSOFT_SOFTWARE_STATES.COLLECT_COMPANY_NAME:
                session.applicationData.companyName = userInput;
                session.state = this.MICROSOFT_SOFTWARE_STATES.COLLECT_CONTACT_NAME;
                return {
                    type: 'message',
                    content: `Thank you! Now please provide your *Full Name*:`
                };
                
            case this.MICROSOFT_SOFTWARE_STATES.COLLECT_CONTACT_NAME:
                session.applicationData.contactName = userInput;
                session.state = this.MICROSOFT_SOFTWARE_STATES.COLLECT_EMAIL;
                return {
                    type: 'message',
                    content: `Great! Now please provide your *Email Address*:`
                };
                
            case this.MICROSOFT_SOFTWARE_STATES.COLLECT_EMAIL:
                // Validate email format
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(userInput)) {
                    return {
                        type: 'message',
                        content: `❌ Invalid email format. Please provide a valid email address:`
                    };
                }
                session.applicationData.email = userInput.toLowerCase();
                session.state = this.MICROSOFT_SOFTWARE_STATES.COLLECT_PHONE;
                return {
                    type: 'message',
                    content: `Perfect! Finally, please provide your *Phone Number*:`
                };
                
            case this.MICROSOFT_SOFTWARE_STATES.COLLECT_PHONE:
                session.applicationData.phoneNumber = userInput;
                session.state = this.MICROSOFT_SOFTWARE_STATES.CONFIRM_APPLICATION;
                
                // Format application summary
                const summary = `
📋 *Application Summary*

*Service:* ${session.selectedSubService}
*Company Name:* ${session.applicationData.companyName}
*Contact Name:* ${session.applicationData.contactName}
*Email:* ${session.applicationData.email}
*Phone:* ${session.applicationData.phoneNumber}

Please confirm if this information is correct by typing 'confirm' to submit your application, or 'cancel' to start over.
                `;
                
                return {
                    type: 'message',
                    content: summary
                };
                
            case this.MICROSOFT_SOFTWARE_STATES.CONFIRM_APPLICATION:
                if (userInput.toLowerCase() === 'confirm') {
                    // Create application via API call
                    try {
                        const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                        
                        if (applicationResult.success) {
                            session.state = this.MICROSOFT_SOFTWARE_STATES.MICROSOFT_SOFTWARE_END;
                            session.applicationData.applicationId = applicationResult.applicationId;
                            
                            return {
                                type: 'message',
                                content: `✅ *Application Submitted Successfully!*\n\n📋 **Application Details:**\n• Service: ${session.selectedSubService}\n• Company: ${session.applicationData.companyName}\n• Contact: ${session.applicationData.contactName}\n• Reference: ${applicationResult.referenceNumber || 'Pending'}\n\nThank you for your application. Our Microsoft specialists will contact you within 24 hours at ${session.applicationData.phoneNumber} or ${session.applicationData.email} to discuss your software needs.\n\nType 'menu' to return to the main menu or 'back' to return to Microsoft Software services.`
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
                    session.state = this.MICROSOFT_SOFTWARE_STATES.PRICING_INFO;
                    session.applicationData = {};
                    return this.showPricingInformation(session);
                } else if (userInput.toLowerCase() === 'retry') {
                    // Try to create application again
                    try {
                        const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                        
                        if (applicationResult.success) {
                            session.state = this.MICROSOFT_SOFTWARE_STATES.MICROSOFT_SOFTWARE_END;
                            session.applicationData.applicationId = applicationResult.applicationId;
                            
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
            // Go back to Microsoft Software main menu
            session.state = 'microsoft_software';
            session.selectedSubService = null;
            session.applicationData = {};
            
            return {
                type: 'template',
                templateSid: 'HX_microsoft_software_template', // Microsoft Software template
                variables: {}
            };
        }

        if (userInput.toLowerCase() === 'menu') {
            // Go to main menu
            session.state = 'main_menu';
            session.selectedService = null;
            session.selectedSubService = null;
            session.applicationData = {};
            
            return {
                type: 'template',
                templateSid: 'HX1709f2dbf88a5e5cf077a618ada6a8e0', // Main menu template
                variables: {}
            };
        }

        // Default response for Microsoft Software states
        const serviceName = session.selectedSubService || 'Microsoft Software Service';
        return {
            type: 'message',
            content: `📋 You're in the *${serviceName}* section.\n\nPlease use the interactive buttons or:\n• Type 'proceed' to start application\n• Type 'back' to return to Microsoft Software services\n• Type 'menu' for main menu\n• Type 'help' for assistance`
        };
    }

    // Create application via API call
    async createApplicationViaAPI(session, phoneNumber) {
        try {
            // Prepare application data for API
            const applicationData = {
                companyName: session.applicationData.companyName || 'Not provided',
                email: session.applicationData.email || 'Not provided',
                contactPerson: session.applicationData.contactName || 'Not provided',
                phoneNumber: session.applicationData.phoneNumber || 'Not provided',
                serviceType: session.selectedSubService || 'Microsoft Software Service',
                status: 'Pending',
                whatsappNumber: phoneNumber,
                applicationDate: new Date().toISOString(),
                pricingInfo: this.PRICING[session.selectedSubService] || {},
                flowSessionData: session.applicationData // Store complete session data for reference
            };
            
            this.debug('Calling API to create Microsoft software application', {
                url: `${this.API_BASE_URL}/microsoft-applications`,
                data: applicationData
            });
            
            // Make API call to your Microsoft applications endpoint
            const response = await axios.post(`${this.API_BASE_URL}/microsoft-applications`, applicationData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });
            
            if (response.data.success) {
                this.debug('Microsoft software application created successfully via API', {
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

    // Get Microsoft software summary for admin/debugging
    getMicrosoftSoftwareSummary(session) {
        if (!this.isMicrosoftSoftwareState(session.state)) return null;

        return {
            currentService: session.selectedSubService || 'Microsoft Software Service',
            currentState: session.state,
            applicationData: session.applicationData || {},
            applicationId: session.applicationData?.applicationId || 'Not created',
            pricingInfo: this.PRICING[session.selectedSubService] || {}
        };
    }

    // Calculate progress through Microsoft software flow
    calculateProgress(session) {
        if (!this.isMicrosoftSoftwareState(session.state)) return 0;

        const stateProgress = {
            [this.MICROSOFT_SOFTWARE_STATES.MICROSOFT_EXCEL]: 10,
            [this.MICROSOFT_SOFTWARE_STATES.OFFICE_365_COPILOT]: 10,
            [this.MICROSOFT_SOFTWARE_STATES.EMAIL_SERVER]: 10,
            [this.MICROSOFT_SOFTWARE_STATES.PRICING_INFO]: 20,
            [this.MICROSOFT_SOFTWARE_STATES.COLLECT_COMPANY_NAME]: 40,
            [this.MICROSOFT_SOFTWARE_STATES.COLLECT_CONTACT_NAME]: 60,
            [this.MICROSOFT_SOFTWARE_STATES.COLLECT_EMAIL]: 80,
            [this.MICROSOFT_SOFTWARE_STATES.COLLECT_PHONE]: 90,
            [this.MICROSOFT_SOFTWARE_STATES.CONFIRM_APPLICATION]: 95,
            [this.MICROSOFT_SOFTWARE_STATES.MICROSOFT_SOFTWARE_END]: 100
        };

        return stateProgress[session.state] || 0;
    }
}

module.exports = MicrosoftSoftwareFlow;