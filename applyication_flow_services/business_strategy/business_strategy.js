// business_strategy_flow.js - WhatsApp Chatbot Business Strategy Flow (Updated with API Integration)
const axios = require('axios');

class BusinessStrategyFlow {
    constructor() {
        // Business Strategy sub-services states
        this.BUSINESS_STRATEGY_STATES = {
            STRATEGIC_PLANNING: 'strategic_planning',
            BUSINESS_PLAN_DEVELOPMENT: 'business_plan_development',
            MARKET_RESEARCH: 'market_research',
            FEASIBILITY_STUDIES: 'feasibility_studies',
            PRICING_INFO: 'pricing_info_strategy',
            COLLECT_COMPANY_NAME: 'collect_company_name_strategy',
            COLLECT_CONTACT_NAME: 'collect_contact_name_strategy',
            COLLECT_EMAIL: 'collect_email_strategy',
            COLLECT_PHONE: 'collect_phone_strategy',
            CONFIRM_APPLICATION: 'confirm_application_strategy',
            STRATEGY_END: 'strategy_end'
        };

        // Template IDs for Business Strategy sub-services
        this.BUSINESS_STRATEGY_TEMPLATES = {
            STRATEGIC_PLANNING: 'HX8436e2c0ca7211d69d0f6d7b21a29cfb',
            BUSINESS_PLAN_DEVELOPMENT: 'HX8436e2c0ca7211d69d0f6d7b21a29cfb', 
            MARKET_RESEARCH: 'HX8436e2c0ca7211d69d0f6d7b21a29cfb',
            FEASIBILITY_STUDIES: 'HX8436e2c0ca7211d69d0f6d7b21a29cfb'
        };

        // Business Strategy sub-services mapping
        this.BUSINESS_STRATEGY_SUB_SERVICES = {
            'Strategic Planning': {
                templateId: this.BUSINESS_STRATEGY_TEMPLATES.STRATEGIC_PLANNING,
                state: this.BUSINESS_STRATEGY_STATES.STRATEGIC_PLANNING
            },
            'Business Plan Development': {
                templateId: this.BUSINESS_STRATEGY_TEMPLATES.BUSINESS_PLAN_DEVELOPMENT,
                state: this.BUSINESS_STRATEGY_STATES.BUSINESS_PLAN_DEVELOPMENT
            },
            'Market Research': {
                templateId: this.BUSINESS_STRATEGY_TEMPLATES.MARKET_RESEARCH,
                state: this.BUSINESS_STRATEGY_STATES.MARKET_RESEARCH
            },
            'Feasibility Studies': {
                templateId: this.BUSINESS_STRATEGY_TEMPLATES.FEASIBILITY_STUDIES,
                state: this.BUSINESS_STRATEGY_STATES.FEASIBILITY_STUDIES
            }
        };

        // Pricing information for each service
        this.PRICING = {
            'Strategic Planning': {
                'Basic Consultation': '$500',
                'Comprehensive Strategy': '$2000', 
                'Ongoing Support': 'Custom pricing'
            },
            'Business Plan Development': {
                'Standard Plan': '$1500',
                'Investor-Ready Plan': '$3000',
                'Custom Package': 'Contact for quote'
            },
            'Market Research': {
                'Industry Analysis': '$1000',
                'Competitive Analysis': '$1500',
                'Custom Research': 'Contact for quote'
            },
            'Feasibility Studies': {
                'Basic Study': '$1200',
                'Comprehensive Study': '$2500',
                'Industry Specific': 'Custom pricing'
            }
        };

        // API base URL - configure this based on your environment
        this.API_BASE_URL = 'https://echolar-admin-final.onrender.com/api/v1';

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] BUSINESS_STRATEGY_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Check if current state is a Business Strategy state
    isBusinessStrategyState(state) {
        return Object.values(this.BUSINESS_STRATEGY_STATES).includes(state);
    }

    // Start Business Strategy sub-service
    startBusinessStrategySubService(session, phoneNumber, subServiceName) {
        const subService = this.BUSINESS_STRATEGY_SUB_SERVICES[subServiceName];
        
        if (subService) {
            session.state = subService.state;
            session.selectedSubService = subServiceName;
            session.applicationData = {}; // Initialize application data
            
            this.debug('Starting Business Strategy sub-service', {
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
            content: `❌ Invalid Business Strategy service selection. Please choose from the available options.`
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

    // Process Business Strategy input
    async processBusinessStrategyInput(message, session, phoneNumber) {
        const userInput = message.trim();
        this.debug('Processing Business Strategy input', {
            phoneNumber,
            currentState: session.state,
            userInput,
            originalMessage: message
        });

        // Handle "Apply selected" or "proceed" to start application
        if ((userInput.toLowerCase() === 'proceed' || userInput.toLowerCase() === 'apply') && 
            session.state === this.BUSINESS_STRATEGY_STATES.PRICING_INFO) {
            
            session.state = this.BUSINESS_STRATEGY_STATES.COLLECT_COMPANY_NAME;
            this.debug('Business Strategy application started', { phoneNumber });

            return {
                type: 'message',
                content: `📋 You've selected to apply for *${session.selectedSubService}*.\n\nLet's collect some information to process your application.\n\nPlease provide your *Company Name*:`
            };
        }

        // Handle application data collection
        switch (session.state) {
            case this.BUSINESS_STRATEGY_STATES.COLLECT_COMPANY_NAME:
                session.applicationData.companyName = userInput;
                session.state = this.BUSINESS_STRATEGY_STATES.COLLECT_CONTACT_NAME;
                return {
                    type: 'message',
                    content: `Thank you! Now please provide your *Full Name*:`
                };
                
            case this.BUSINESS_STRATEGY_STATES.COLLECT_CONTACT_NAME:
                session.applicationData.contactName = userInput;
                session.state = this.BUSINESS_STRATEGY_STATES.COLLECT_EMAIL;
                return {
                    type: 'message',
                    content: `Great! Now please provide your *Email Address*:`
                };
                
            case this.BUSINESS_STRATEGY_STATES.COLLECT_EMAIL:
                // Validate email format
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(userInput)) {
                    return {
                        type: 'message',
                        content: `❌ Invalid email format. Please provide a valid email address:`
                    };
                }
                session.applicationData.email = userInput.toLowerCase();
                session.state = this.BUSINESS_STRATEGY_STATES.COLLECT_PHONE;
                return {
                    type: 'message',
                    content: `Perfect! Finally, please provide your *Phone Number*:`
                };
                
            case this.BUSINESS_STRATEGY_STATES.COLLECT_PHONE:
                session.applicationData.phoneNumber = userInput;
                session.state = this.BUSINESS_STRATEGY_STATES.CONFIRM_APPLICATION;
                
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
                
            case this.BUSINESS_STRATEGY_STATES.CONFIRM_APPLICATION:
                if (userInput.toLowerCase() === 'confirm') {
                    // Create application via API call
                    try {
                        const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                        
                        if (applicationResult.success) {
                            session.state = this.BUSINESS_STRATEGY_STATES.STRATEGY_END;
                            session.applicationData.applicationId = applicationResult.applicationId;
                            
                            return {
                                type: 'message',
                                content: `✅ *Application Submitted Successfully!*\n\n📋 **Application Details:**\n• Service: ${session.selectedSubService}\n• Company: ${session.applicationData.companyName}\n• Contact: ${session.applicationData.contactName}\n• Reference: ${applicationResult.referenceNumber || 'Pending'}\n\nThank you for your application. Our strategy specialists will contact you within 24 hours at ${session.applicationData.phoneNumber} or ${session.applicationData.email} to discuss your strategy needs.\n\nType 'menu' to return to the main menu or 'back' to return to Business Strategy services.`
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
                    session.state = this.BUSINESS_STRATEGY_STATES.PRICING_INFO;
                    session.applicationData = {};
                    return this.showPricingInformation(session);
                } else if (userInput.toLowerCase() === 'retry') {
                    // Try to create application again
                    try {
                        const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                        
                        if (applicationResult.success) {
                            session.state = this.BUSINESS_STRATEGY_STATES.STRATEGY_END;
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
            // Go back to Business Strategy main menu
            session.state = 'business_strategy';
            session.selectedSubService = null;
            session.applicationData = {};
            
            return {
                type: 'template',
                templateSid: 'HXa4f1174d6825429e34b5db664eb5071b', // Business Strategy main template
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

        // Default response for Business Strategy states
        const serviceName = session.selectedSubService || 'Business Strategy Service';
        return {
            type: 'message',
            content: `📋 You're in the *${serviceName}* section.\n\nPlease use the interactive buttons or:\n• Type 'proceed' to start application\n• Type 'back' to return to Business Strategy services\n• Type 'menu' for main menu\n• Type 'help' for assistance`
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
                serviceType: session.selectedSubService || 'Business Strategy Service',
                status: 'Pending',
                whatsappNumber: phoneNumber,
                applicationDate: new Date().toISOString(),
                pricingInfo: this.PRICING[session.selectedSubService] || {},
                flowSessionData: session.applicationData // Store complete session data for reference
            };
            
            this.debug('Calling API to create business strategy application', {
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
                this.debug('Business strategy application created successfully via API', {
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

    // Get Business Strategy summary for admin/debugging
    getBusinessStrategySummary(session) {
        if (!this.isBusinessStrategyState(session.state)) return null;

        return {
            currentService: session.selectedSubService || 'Business Strategy Service',
            currentState: session.state,
            applicationData: session.applicationData || {},
            applicationId: session.applicationData?.applicationId || 'Not created',
            pricingInfo: this.PRICING[session.selectedSubService] || {}
        };
    }

    // Calculate progress through Business Strategy flow
    calculateProgress(session) {
        if (!this.isBusinessStrategyState(session.state)) return 0;

        const stateProgress = {
            [this.BUSINESS_STRATEGY_STATES.STRATEGIC_PLANNING]: 10,
            [this.BUSINESS_STRATEGY_STATES.BUSINESS_PLAN_DEVELOPMENT]: 10,
            [this.BUSINESS_STRATEGY_STATES.MARKET_RESEARCH]: 10,
            [this.BUSINESS_STRATEGY_STATES.FEASIBILITY_STUDIES]: 10,
            [this.BUSINESS_STRATEGY_STATES.PRICING_INFO]: 20,
            [this.BUSINESS_STRATEGY_STATES.COLLECT_COMPANY_NAME]: 40,
            [this.BUSINESS_STRATEGY_STATES.COLLECT_CONTACT_NAME]: 60,
            [this.BUSINESS_STRATEGY_STATES.COLLECT_EMAIL]: 80,
            [this.BUSINESS_STRATEGY_STATES.COLLECT_PHONE]: 90,
            [this.BUSINESS_STRATEGY_STATES.CONFIRM_APPLICATION]: 95,
            [this.BUSINESS_STRATEGY_STATES.STRATEGY_END]: 100
        };

        return stateProgress[session.state] || 0;
    }
}

module.exports = BusinessStrategyFlow;