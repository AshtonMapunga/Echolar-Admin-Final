const axios = require('axios');

class VatRegistrationFlow {
    constructor() {
        // VAT registration specific states
        this.VAT_STATES = {
            VAT_START: 'vat_start',
            QUICK_REPLY_TEMPLATE: 'vat_quick_reply',
            COLLECT_COMPANY_NAME: 'vat_collect_company_name',
            COLLECT_CONTACT_NAME: 'vat_collect_contact_name',
            COLLECT_EMAIL: 'vat_collect_email',
            COLLECT_PHONE: 'vat_collect_phone',
            CONFIRM_APPLICATION: 'vat_confirm_application',
            SUCCESS_TEMPLATE: 'vat_success_template',
            VAT_END: 'vat_end'
        };

        // Template IDs
        this.TEMPLATES = {
            QUICK_REPLY: 'HX6927d947dff7d3147b5449eeb7770c5e',
            SUCCESS: 'HXd0eabe70e6ce553fe42c827fc5d6b452'
        };

        // API base URL
        this.API_BASE_URL = 'https://chatbotbackend-1ox6.onrender.com/api/v1';

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] VAT_REGISTRATION_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Check if current state is a VAT registration state
    isVatState(state) {
        return Object.values(this.VAT_STATES).includes(state);
    }

    // Start the VAT registration process
    async startVatRegistration(session, phoneNumber) {
        this.debug('Starting VAT registration flow', { phoneNumber });

        // Initialize VAT registration data
        session.vatData = {
            startTime: new Date().toISOString(),
            step: 'quick_reply_template',
            applicationStatus: 'initiated',
            applicationData: {} // Initialize application data
        };

        session.state = this.VAT_STATES.QUICK_REPLY_TEMPLATE;

        return {
            type: 'template',
            templateSid: this.TEMPLATES.QUICK_REPLY,
            variables: {}
        };
    }

    // Process VAT registration input
    async processVatInput(message, session, phoneNumber) {
        this.debug('Processing VAT registration input', {
            phoneNumber,
            state: session.state,
            message,
            vatData: session.vatData
        });

        const userInput = message.trim();

        // Handle "Apply" button click or "apply" text input
        if ((userInput === '1' || userInput.toLowerCase() === 'apply') && 
            session.state === this.VAT_STATES.QUICK_REPLY_TEMPLATE) {
            
            session.state = this.VAT_STATES.COLLECT_COMPANY_NAME;
            this.debug('VAT application started', { phoneNumber });

            return {
                type: 'message',
                content: `You've selected to apply for VAT Registration.\n\nLet's collect some information to process your application.\n\nPlease provide your Company Name:`
            };
        }

        if (userInput === '2' || userInput.toLowerCase() === 'back') {
            session.state = 'main_menu';
            return {
                type: 'message',
                content: `Returning to main menu...\n\nType 'menu' to see main services.`
            };
        }

        // Handle application data collection
        switch (session.state) {
            case this.VAT_STATES.COLLECT_COMPANY_NAME:
                session.vatData.applicationData.companyName = userInput;
                session.state = this.VAT_STATES.COLLECT_CONTACT_NAME;
                return {
                    type: 'message',
                    content: `Thank you! Now please provide your Full Name:`
                };

            case this.VAT_STATES.COLLECT_CONTACT_NAME:
                session.vatData.applicationData.contactName = userInput;
                session.state = this.VAT_STATES.COLLECT_EMAIL;
                return {
                    type: 'message',
                    content: `Great! Now please provide your Email Address:`
                };

            case this.VAT_STATES.COLLECT_EMAIL:
                // Validate email format
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(userInput)) {
                    return {
                        type: 'message',
                        content: `Invalid email format. Please provide a valid email address:`
                    };
                }
                session.vatData.applicationData.email = userInput.toLowerCase();
                session.state = this.VAT_STATES.COLLECT_PHONE;
                return {
                    type: 'message',
                    content: `Perfect! Finally, please provide your Phone Number:`
                };

            case this.VAT_STATES.COLLECT_PHONE:
                session.vatData.applicationData.phoneNumber = userInput;
                session.state = this.VAT_STATES.CONFIRM_APPLICATION;

                // Format application summary
                const summary = `VAT Registration Application Summary\n\nCompany Name: ${session.vatData.applicationData.companyName}\nContact Name: ${session.vatData.applicationData.contactName}\nEmail: ${session.vatData.applicationData.email}\nPhone: ${session.vatData.applicationData.phoneNumber}\n\n1. Confirm - Submit application\n2. Cancel - Start over\n\nPlease select 1 or 2:`;

                return {
                    type: 'message',
                    content: summary
                };

            case this.VAT_STATES.CONFIRM_APPLICATION:
                if (userInput === '1' || userInput.toLowerCase() === 'confirm') {
                    // Create application via API call
                    try {
                        const applicationResult = await this.createVatApplicationViaAPI(session, phoneNumber);

                        if (applicationResult.success) {
                            session.state = this.VAT_STATES.SUCCESS_TEMPLATE;
                            session.vatData.applicationData.applicationId = applicationResult.applicationId;

                            return {
                                type: 'template',
                                templateSid: this.TEMPLATES.SUCCESS,
                                variables: {
                                    referenceNumber: applicationResult.referenceNumber || 'Pending',
                                    timestamp: new Date().toLocaleString()
                                }
                            };
                        } else {
                            this.debug('API call failed', applicationResult);
                            return {
                                type: 'message',
                                content: `Error creating application: ${applicationResult.message}\n\n1. Retry - Try again\n2. Back - Modify information\n\nPlease select 1 or 2:`
                            };
                        }
                    } catch (error) {
                        this.debug('Error creating application via API', error);
                        return {
                            type: 'message',
                            content: `Error creating application. Please try again or contact support.\n\n1. Retry - Try again\n\nPlease select 1 to retry:`
                        };
                    }
                } else if (userInput === '2' || userInput.toLowerCase() === 'cancel') {
                    session.state = this.VAT_STATES.QUICK_REPLY_TEMPLATE;
                    session.vatData.applicationData = {};
                    return {
                        type: 'template',
                        templateSid: this.TEMPLATES.QUICK_REPLY,
                        variables: {}
                    };
                } else if (userInput === '1' || userInput.toLowerCase() === 'retry') {
                    // Try to create application again
                    try {
                        const applicationResult = await this.createVatApplicationViaAPI(session, phoneNumber);

                        if (applicationResult.success) {
                            session.state = this.VAT_STATES.SUCCESS_TEMPLATE;
                            session.vatData.applicationData.applicationId = applicationResult.applicationId;

                            return {
                                type: 'template',
                                templateSid: this.TEMPLATES.SUCCESS,
                                variables: {
                                    referenceNumber: applicationResult.referenceNumber || 'Pending',
                                    timestamp: new Date().toLocaleString()
                                }
                            };
                        } else {
                            return {
                                type: 'message',
                                content: `Error creating application: ${applicationResult.message}\n\nPlease contact support for assistance.`
                            };
                        }
                    } catch (error) {
                        this.debug('Retry failed', error);
                        return {
                            type: 'message',
                            content: `Error persists. Please contact support for assistance.`
                        };
                    }
                } else {
                    return {
                        type: 'message',
                        content: `Please select:\n1. Confirm - Submit application\n2. Cancel - Start over\n\nPlease select 1 or 2:`
                    };
                }

            case this.VAT_STATES.SUCCESS_TEMPLATE:
                return await this.handleSuccessTemplate(userInput, session, phoneNumber);

            case this.VAT_STATES.VAT_END:
                return await this.handleVatEnd(userInput, session, phoneNumber);

            default:
                return await this.handleDefault(userInput, session, phoneNumber);
        }
    }

    // Create VAT application via API call
    async createVatApplicationViaAPI(session, phoneNumber) {
        try {
            // Prepare application data for API
            const applicationData = {
                companyName: session.vatData.applicationData.companyName || 'Not provided',
                email: session.vatData.applicationData.email || 'Not provided',
                contactName: session.vatData.applicationData.contactName || 'Not provided',
                phoneNumber: session.vatData.applicationData.phoneNumber || 'Not provided',
                serviceType: 'VAT Registration', // Fixed service type
                status: 'Pending',
                whatsappNumber: phoneNumber,
                applicationDate: new Date().toISOString(),
                flowSessionData: session.vatData.applicationData // Store complete session data for reference
            };

            this.debug('Calling API to create VAT application', {
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
                this.debug('VAT application created successfully via API', {
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

    // Handle success template state
    async handleSuccessTemplate(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        if (userInput === '1' || userInput === 'done') {
            session.state = this.VAT_STATES.VAT_END;
            session.vatData.step = 'completed';
            session.vatData.completedAt = new Date().toISOString();

            return {
                type: 'message',
                content: `VAT Registration Application Complete!\n\nYour application has been successfully submitted.\n\nNext Steps:\n1. Our team will review your application\n2. We'll contact you within 2-3 business days\n3. You'll receive your VAT certificate via email\n\n1. Start - New application\n2. Menu - Main services\n\nPlease select 1 or 2:`
            };
        }

        if (userInput === '2' || userInput === 'menu') {
            return {
                type: 'message',
                content: `Returning to main menu...\n\nType 'menu' to see main services.`
            };
        }

        // If user sends other input, provide completion instructions
        return {
            type: 'message',
            content: `Your VAT registration application has been submitted successfully!\n\n1. Done - Complete process\n2. Menu - Return to main services\n\nPlease select 1 or 2:`
        };
    }

    // Handle VAT end state
    async handleVatEnd(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        if (userInput === '1' || userInput === 'start') {
            delete session.vatData;
            session.state = 'main_menu';
            
            return {
                type: 'message',
                content: `Starting new process...\n\nType 'menu' to see all available services.`
            };
        }

        if (userInput === '2' || userInput === 'menu') {
            delete session.vatData;
            session.state = 'main_menu';
            
            return {
                type: 'message',
                content: `Returning to main menu...\n\nType 'menu' to see main services.`
            };
        }

        return {
            type: 'message',
            content: `Your VAT registration application is complete!\n\n1. Start - New application\n2. Menu - Main services\n\nPlease select 1 or 2:`
        };
    }

    // Handle default/fallback
    async handleDefault(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        if (userInput === 'back' || userInput === 'menu') {
            return {
                type: 'message',
                content: `Returning to main menu...\n\nType 'menu' to see main services.`
            };
        }

        return {
            type: 'message',
            content: `I didn't understand that. Please follow the prompts.`
        };
    }

    // Get VAT registration summary
    getVatSummary(session) {
        if (!session.vatData) return null;

        return {
            step: session.vatData.step,
            startTime: session.vatData.startTime,
            applicationStatus: session.vatData.applicationStatus,
            applicationData: session.vatData.applicationData || {},
            applicationSubmitted: session.vatData.applicationSubmitted,
            completedAt: session.vatData.completedAt,
            currentState: session.state
        };
    }

    // Calculate progress percentage
    calculateProgress(session) {
        if (!session.vatData) return 0;

        const stateProgress = {
            [this.VAT_STATES.QUICK_REPLY_TEMPLATE]: 10,
            [this.VAT_STATES.COLLECT_COMPANY_NAME]: 25,
            [this.VAT_STATES.COLLECT_CONTACT_NAME]: 40,
            [this.VAT_STATES.COLLECT_EMAIL]: 60,
            [this.VAT_STATES.COLLECT_PHONE]: 80,
            [this.VAT_STATES.CONFIRM_APPLICATION]: 90,
            [this.VAT_STATES.SUCCESS_TEMPLATE]: 95,
            [this.VAT_STATES.VAT_END]: 100
        };

        return stateProgress[session.state] || 0;
    }
}

// Make sure to export the class correctly
module.exports = VatRegistrationFlow;