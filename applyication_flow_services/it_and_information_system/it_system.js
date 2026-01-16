// it_management_flow.js - WhatsApp Chatbot IT Management Flow (Updated with API Integration)
const axios = require('axios');

class ITManagementFlow {
    constructor() {
        // IT Management sub-services states
        this.IT_STATES = {
            IT_AUDIT: 'it_audit',
            SOFTWARE_INTELLIGENCE: 'software_intelligence',
            SYSTEMS_INSTALLATIONS: 'systems_installations',
            THERMAL_PRINTERS: 'thermal_printers',
            PRICING_INFO: 'pricing_info_it',
            COLLECT_COMPANY_NAME: 'collect_company_name_it',
            COLLECT_CONTACT_NAME: 'collect_contact_name_it',
            COLLECT_EMAIL: 'collect_email_it',
            COLLECT_PHONE: 'collect_phone_it',
            CONFIRM_APPLICATION: 'confirm_application_it',
            IT_END: 'it_end'
        };

        // Template IDs for IT sub-services
        this.IT_TEMPLATES = {
            IT_AUDIT: 'HXfb0f36358bcdbca9a7742b5107e2fddf',
            SOFTWARE_INTELLIGENCE: 'HX7f301c313989a0f88d494b2e0a2e69dd',
            SYSTEMS_INSTALLATIONS: 'HX98ca59d8a7987209885d081aed32c6e9',
            THERMAL_PRINTERS: 'HXad85adb917b23f84a24a2ffdb2924957'
        };

        // IT sub-services mapping
        this.IT_SUB_SERVICES = {
            'IT Audit & Consultancy': {
                templateId: this.IT_TEMPLATES.IT_AUDIT,
                state: this.IT_STATES.IT_AUDIT
            },
            'Software Intelligence': {
                templateId: this.IT_TEMPLATES.SOFTWARE_INTELLIGENCE,
                state: this.IT_STATES.SOFTWARE_INTELLIGENCE
            },
            'Systems Installations': {
                templateId: this.IT_TEMPLATES.SYSTEMS_INSTALLATIONS,
                state: this.IT_STATES.SYSTEMS_INSTALLATIONS
            },
            'Thermal Printers': {
                templateId: this.IT_TEMPLATES.THERMAL_PRINTERS,
                state: this.IT_STATES.THERMAL_PRINTERS
            }
        };

        // Pricing information for each service
        this.PRICING = {
            'IT Audit & Consultancy': {
                'Basic Audit': '$800',
                'Comprehensive Audit': '$2000', 
                'Ongoing Consultancy': 'Custom pricing'
            },
            'Software Intelligence': {
                'Software Analysis': '$1200',
                'Optimization Plan': '$2500',
                'Implementation Support': 'Custom pricing'
            },
            'Systems Installations': {
                'Standard Installation': '$1500',
                'Enterprise Setup': '$3500',
                'Custom Configuration': 'Contact for quote'
            },
            'Thermal Printers': {
                'Basic Setup': '$300',
                'Advanced Configuration': '$800',
                'Bulk Deployment': 'Custom pricing'
            }
        };

        // API base URL - configure this based on your environment
        this.API_BASE_URL = 'https://chatbotbackend-1ox6.onrender.com/api/v1';

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] IT_MANAGEMENT_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Check if current state is an IT management state
    isITState(state) {
        return Object.values(this.IT_STATES).includes(state);
    }

    // Start IT sub-service
    startITSubService(session, phoneNumber, subServiceName) {
        const subService = this.IT_SUB_SERVICES[subServiceName];
        
        if (subService) {
            session.selectedSubService = subServiceName;
            session.state = this.IT_STATES.PRICING_INFO; // CHANGED: Set to PRICING_INFO instead of sub-service specific state
            session.applicationData = {}; // Initialize application data
            
            this.debug('Starting IT sub-service', {
                phoneNumber,
                subService: subServiceName,
                state: session.state
            });

            return this.showPricingInformation(session); // CHANGED: Return pricing info immediately
        }

        return {
            type: 'message',
            content: `❌ Invalid IT service selection. Please choose from the available options.`
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

    // Process IT management input
    async processITInput(message, session, phoneNumber) {
        const userInput = message.trim();
        this.debug('Processing IT input', {
            phoneNumber,
            currentState: session.state,
            userInput,
            originalMessage: message
        });

        // Handle "proceed" or "apply" when in PRICING_INFO state
        if ((userInput.toLowerCase() === 'proceed' || userInput.toLowerCase() === 'apply') && 
            session.state === this.IT_STATES.PRICING_INFO) {
            
            session.state = this.IT_STATES.COLLECT_COMPANY_NAME;
            this.debug('IT application started', { 
                phoneNumber,
                service: session.selectedSubService 
            });

            return {
                type: 'message',
                content: `📋 You've selected to apply for *${session.selectedSubService}*.\n\nLet's collect some information to process your application.\n\nPlease provide your *Company Name*:`
            };
        }

        // Handle "proceed" when in sub-service specific states (for backward compatibility)
        if ((userInput.toLowerCase() === 'proceed' || userInput.toLowerCase() === 'apply') && 
            [this.IT_STATES.IT_AUDIT, 
             this.IT_STATES.SOFTWARE_INTELLIGENCE, 
             this.IT_STATES.SYSTEMS_INSTALLATIONS, 
             this.IT_STATES.THERMAL_PRINTERS].includes(session.state)) {
            
            // If user types "proceed" while in sub-service state, show pricing info
            session.state = this.IT_STATES.PRICING_INFO;
            return this.showPricingInformation(session);
        }

        // Handle application data collection
        switch (session.state) {
            case this.IT_STATES.COLLECT_COMPANY_NAME:
                session.applicationData.companyName = userInput;
                session.state = this.IT_STATES.COLLECT_CONTACT_NAME;
                return {
                    type: 'message',
                    content: `Thank you! Now please provide your *Full Name*:`
                };
                
            case this.IT_STATES.COLLECT_CONTACT_NAME:
                session.applicationData.contactName = userInput;
                session.state = this.IT_STATES.COLLECT_EMAIL;
                return {
                    type: 'message',
                    content: `Great! Now please provide your *Email Address*:`
                };
                
            case this.IT_STATES.COLLECT_EMAIL:
                // Validate email format
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(userInput)) {
                    return {
                        type: 'message',
                        content: `❌ Invalid email format. Please provide a valid email address:`
                    };
                }
                session.applicationData.email = userInput.toLowerCase();
                session.state = this.IT_STATES.COLLECT_PHONE;
                return {
                    type: 'message',
                    content: `Perfect! Finally, please provide your *Phone Number*:`
                };
                
            case this.IT_STATES.COLLECT_PHONE:
                session.applicationData.phoneNumber = userInput;
                session.state = this.IT_STATES.CONFIRM_APPLICATION;
                
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
                
            case this.IT_STATES.CONFIRM_APPLICATION:
                if (userInput.toLowerCase() === 'confirm') {
                    // Create application via API call
                    try {
                        const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                        
                        if (applicationResult.success) {
                            session.state = this.IT_STATES.IT_END;
                            session.applicationData.applicationId = applicationResult.applicationId;
                            
                            return {
                                type: 'message',
                                content: `✅ *Application Submitted Successfully!*\n\n📋 **Application Details:**\n• Service: ${session.selectedSubService}\n• Company: ${session.applicationData.companyName}\n• Contact: ${session.applicationData.contactName}\n• Reference: ${applicationResult.referenceNumber || 'Pending'}\n\nThank you for your application. Our IT specialists will contact you within 24 hours at ${session.applicationData.phoneNumber} or ${session.applicationData.email} to discuss your IT needs.\n\nType 'menu' to return to the main menu or 'back' to return to IT services.`
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
                    session.state = this.IT_STATES.PRICING_INFO;
                    session.applicationData = {};
                    return this.showPricingInformation(session);
                } else if (userInput.toLowerCase() === 'retry') {
                    // Try to create application again
                    try {
                        const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                        
                        if (applicationResult.success) {
                            session.state = this.IT_STATES.IT_END;
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
            // Go back to IT main menu
            session.state = 'it_is_management';
            session.selectedSubService = null;
            session.applicationData = {};
            
            return {
                type: 'template',
                templateSid: 'HXc7b4fbad99fe9dc75f48a96a422bfeb2', // IT main template
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

        // Handle "help" command
        if (userInput.toLowerCase() === 'help') {
            return {
                type: 'message',
                content: `🆘 *Help - IT Management Services*\n\n• Type 'proceed' to start your application\n• Type 'back' to return to IT services menu\n• Type 'menu' for main menu\n• For pricing, type 'proceed' when viewing service details\n\nNeed immediate assistance? Contact our support team at support@example.com`
            };
        }

        // Default response for IT states
        const serviceName = session.selectedSubService || 'IT Service';
        
        // If we're in a sub-service specific state, guide user to type "proceed"
        if ([this.IT_STATES.IT_AUDIT, 
             this.IT_STATES.SOFTWARE_INTELLIGENCE, 
             this.IT_STATES.SYSTEMS_INSTALLATIONS, 
             this.IT_STATES.THERMAL_PRINTERS].includes(session.state)) {
            return {
                type: 'message',
                content: `📋 You're in the *${serviceName}* section.\n\nTo proceed with your application, please type 'proceed' to see pricing information and continue.\n\nOr:\n• Type 'back' to return to IT services\n• Type 'menu' for main menu\n• Type 'help' for assistance`
            };
        }
        
        // For other IT states
        return {
            type: 'message',
            content: `📋 You're in the *${serviceName}* section.\n\nPlease use the interactive buttons or:\n• Type 'proceed' to start application\n• Type 'back' to return to IT services\n• Type 'menu' for main menu\n• Type 'help' for assistance`
        };
    }

    // Create application via API call
    async createApplicationViaAPI(session, phoneNumber) {
        try {
            // Prepare application data for API - mapping to your UniversalApply model
            const applicationData = {
                companyName: session.applicationData.companyName || 'Not provided',
                email: session.applicationData.email || 'Not provided',
                contactName: session.applicationData.contactName || 'Not provided',
                phoneNumber: session.applicationData.phoneNumber || 'Not provided',
                serviceType: session.selectedSubService || 'IT Service',
                status: 'Pending',
                whatsappNumber: phoneNumber,
                applicationDate: new Date().toISOString(),
                pricingInfo: this.PRICING[session.selectedSubService] || {},
                flowSessionData: session.applicationData // Store complete session data for reference
            };
            
            this.debug('Calling API to create IT application', {
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
                this.debug('IT application created successfully via API', {
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

    // Get IT summary for admin/debugging
    getITSummary(session) {
        if (!this.isITState(session.state)) return null;

        return {
            currentService: session.selectedSubService || 'IT Service',
            currentState: session.state,
            applicationData: session.applicationData || {},
            applicationId: session.applicationData?.applicationId || 'Not created',
            pricingInfo: this.PRICING[session.selectedSubService] || {}
        };
    }

    // Calculate progress through IT flow
    calculateProgress(session) {
        if (!this.isITState(session.state)) return 0;

        const stateProgress = {
            [this.IT_STATES.IT_AUDIT]: 10,
            [this.IT_STATES.SOFTWARE_INTELLIGENCE]: 10,
            [this.IT_STATES.SYSTEMS_INSTALLATIONS]: 10,
            [this.IT_STATES.THERMAL_PRINTERS]: 10,
            [this.IT_STATES.PRICING_INFO]: 20,
            [this.IT_STATES.COLLECT_COMPANY_NAME]: 40,
            [this.IT_STATES.COLLECT_CONTACT_NAME]: 60,
            [this.IT_STATES.COLLECT_EMAIL]: 80,
            [this.IT_STATES.COLLECT_PHONE]: 90,
            [this.IT_STATES.CONFIRM_APPLICATION]: 95,
            [this.IT_STATES.IT_END]: 100
        };

        return stateProgress[session.state] || 0;
    }
}

module.exports = ITManagementFlow;