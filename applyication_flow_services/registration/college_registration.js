const axios = require('axios');

class CollegeRegistrationFlow {
    constructor() {
        // College registration specific states
        this.COLLEGE_STATES = {
            COLLEGE_START: 'college_start',
            QUICK_REPLY_TEMPLATE: 'college_quick_reply',
            COLLECT_FULL_NAME: 'collect_full_name',
            COLLECT_CHURCH_NAME: 'collect_church_name',
            COLLECT_EMAIL: 'collect_email',
            COLLECT_PHONE: 'collect_phone',
            CONFIRM_APPLICATION: 'confirm_application',
            SUCCESS_TEMPLATE: 'college_success_template',
            COLLEGE_END: 'college_end'
        };

        // Template IDs
        this.TEMPLATES = {
            QUICK_REPLY: 'HX0bf1b9fe2d3733e140aeefa38d1e83e8',
            SUCCESS: 'HXd0eabe70e6ce553fe42c827fc5d6b452'
        };

        // API base URL
        this.API_BASE_URL = 'https://chatbotbackend-1ox6.onrender.com/api/v1';

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] COLLEGE_REGISTRATION_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Check if current state is a college registration state
    isCollegeState(state) {
        return Object.values(this.COLLEGE_STATES).includes(state);
    }

    // Start the college registration process
    async startCollegeRegistration(session, phoneNumber) {
        this.debug('Starting college registration flow', { phoneNumber });

        // Initialize college registration data
        session.collegeData = {
            startTime: new Date().toISOString(),
            step: 'quick_reply_template',
            applicationStatus: 'initiated',
            userInfo: {}
        };

        session.state = this.COLLEGE_STATES.QUICK_REPLY_TEMPLATE;

        return {
            type: 'template',
            templateSid: this.TEMPLATES.QUICK_REPLY,
            variables: {}
        };
    }

    // Process college registration input
    async processCollegeInput(message, session, phoneNumber) {
        this.debug('Processing college registration input', {
            phoneNumber,
            state: session.state,
            message,
            collegeData: session.collegeData
        });

        switch (session.state) {
            case this.COLLEGE_STATES.QUICK_REPLY_TEMPLATE:
                return await this.handleQuickReplyTemplate(message, session, phoneNumber);

            case this.COLLEGE_STATES.COLLECT_FULL_NAME:
                return await this.handleCollectFullName(message, session, phoneNumber);

            case this.COLLEGE_STATES.COLLECT_CHURCH_NAME:
                return await this.handleCollectChurchName(message, session, phoneNumber);

            case this.COLLEGE_STATES.COLLECT_EMAIL:
                return await this.handleCollectEmail(message, session, phoneNumber);

            case this.COLLEGE_STATES.COLLECT_PHONE:
                return await this.handleCollectPhone(message, session, phoneNumber);

            case this.COLLEGE_STATES.CONFIRM_APPLICATION:
                return await this.handleConfirmApplication(message, session, phoneNumber);

            case this.COLLEGE_STATES.SUCCESS_TEMPLATE:
                return await this.handleSuccessTemplate(message, session, phoneNumber);

            case this.COLLEGE_STATES.COLLEGE_END:
                return await this.handleCollegeEnd(message, session, phoneNumber);

            default:
                return await this.handleDefault(message, session, phoneNumber);
        }
    }

    // Handle quick reply template state
    async handleQuickReplyTemplate(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        // Check if user clicked "Apply" or similar action
        if (userInput === 'apply' || userInput.includes('apply') || userInput === 'yes' || userInput === '1') {
            session.state = this.COLLEGE_STATES.COLLECT_FULL_NAME;
            session.collegeData.step = 'collecting_info';

            return {
                type: 'message',
                content: `College Registration Application\n\nLet's collect some information to process your application.\n\nPlease provide your Full Name:`
            };
        }

        if (userInput === 'back' || userInput === 'menu' || userInput === '2') {
            return {
                type: 'message',
                content: `Returning to main menu...\n\nType 'menu' to see main services.`
            };
        }

        // If user sends other input, remind them to use the Apply option
        return {
            type: 'message',
            content: `Please select an option:\n1. Apply - Start college registration\n2. Back - Return to main menu\n\nPlease select 1 or 2:`
        };
    }

    // Handle full name collection
    async handleCollectFullName(message, session, phoneNumber) {
        const fullName = message.trim();

        if (fullName) {
            session.collegeData.userInfo.fullName = fullName;
            session.state = this.COLLEGE_STATES.COLLECT_CHURCH_NAME;

            return {
                type: 'message',
                content: `Thank you, ${fullName}!\n\nPlease provide your Church/Company Name:`
            };
        }

        return {
            type: 'message',
            content: `Please provide your full name to continue.`
        };
    }

    // Handle church/company name collection
    async handleCollectChurchName(message, session, phoneNumber) {
        const churchName = message.trim();

        if (churchName) {
            session.collegeData.userInfo.churchName = churchName;
            session.state = this.COLLEGE_STATES.COLLECT_EMAIL;

            return {
                type: 'message',
                content: `Church/Company name recorded!\n\nPlease provide your Email Address:`
            };
        }

        return {
            type: 'message',
            content: `Please provide your church/company name to continue.`
        };
    }

    // Handle email collection
    async handleCollectEmail(message, session, phoneNumber) {
        const email = message.trim().toLowerCase();
        const emailRegex = /\S+@\S+\.\S+/;

        if (email && emailRegex.test(email)) {
            session.collegeData.userInfo.email = email;
            session.state = this.COLLEGE_STATES.COLLECT_PHONE;

            return {
                type: 'message',
                content: `Email address recorded!\n\nPlease provide your Phone Number:`
            };
        }

        return {
            type: 'message',
            content: `Please provide a valid email address (e.g., example@email.com):`
        };
    }

    // Handle phone collection
    async handleCollectPhone(message, session, phoneNumber) {
        const phone = message.trim();

        if (phone) {
            session.collegeData.userInfo.phone = phone;
            session.state = this.COLLEGE_STATES.CONFIRM_APPLICATION;

            // Generate confirmation message
            const userInfo = session.collegeData.userInfo;
            const confirmationMessage = `Please Confirm Your Application Details\n\nPersonal Information:\nFull Name: ${userInfo.fullName}\nChurch/Company: ${userInfo.churchName}\nEmail: ${userInfo.email}\nPhone: ${userInfo.phone}\n\n1. Confirm - Submit your application\n2. Edit - Modify information\n3. Cancel - Cancel application\n\nPlease select an option (1, 2, or 3):`;

            return {
                type: 'message',
                content: confirmationMessage
            };
        }

        return {
            type: 'message',
            content: `Please provide your phone number to continue.`
        };
    }

    // Handle application confirmation
    async handleConfirmApplication(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        if (userInput === 'confirm' || userInput === '1') {
            // Submit application via API
            try {
                const applicationResult = await this.createCollegeApplicationViaAPI(session, phoneNumber);
                
                if (applicationResult.success) {
                    session.state = this.COLLEGE_STATES.SUCCESS_TEMPLATE;
                    session.collegeData.step = 'application_submitted';
                    session.collegeData.applicationId = applicationResult.applicationId;
                    session.collegeData.applicationSubmitted = new Date().toISOString();

                    return {
                        type: 'template',
                        templateSid: this.TEMPLATES.SUCCESS,
                        variables: {
                            referenceNumber: applicationResult.referenceNumber,
                            applicantName: session.collegeData.userInfo.fullName,
                            timestamp: new Date().toLocaleString()
                        }
                    };
                } else {
                    this.debug('API call failed', applicationResult);
                    return {
                        type: 'message',
                        content: `Error submitting application: ${applicationResult.message}\n\n1. Retry - Try again\n2. Back - Modify information\n\nPlease select an option (1 or 2):`
                    };
                }
            } catch (error) {
                this.debug('Error creating application via API', error);
                return {
                    type: 'message',
                    content: `Error creating application. Please try again or contact support.\n\n1. Retry - Try again\n\nPlease select 1 to retry:`
                };
            }
        }

        if (userInput === 'edit' || userInput === '2') {
            session.state = this.COLLEGE_STATES.COLLECT_FULL_NAME;
            session.collegeData.userInfo = {};
            
            return {
                type: 'message',
                content: `Let's start over with your information.\n\nPlease provide your Full Name:`
            };
        }

        if (userInput === 'cancel' || userInput === '3') {
            delete session.collegeData;
            session.state = 'main_menu';
            
            return {
                type: 'message',
                content: `College registration cancelled.\n\nType 'menu' to see main services or 'start' to begin a new application.`
            };
        }

        if (userInput === 'retry' || userInput === '1') {
            // Try to create application again
            try {
                const applicationResult = await this.createCollegeApplicationViaAPI(session, phoneNumber);
                
                if (applicationResult.success) {
                    session.state = this.COLLEGE_STATES.SUCCESS_TEMPLATE;
                    session.collegeData.step = 'application_submitted';
                    session.collegeData.applicationId = applicationResult.applicationId;

                    return {
                        type: 'template',
                        templateSid: this.TEMPLATES.SUCCESS,
                        variables: {
                            referenceNumber: applicationResult.referenceNumber,
                            applicantName: session.collegeData.userInfo.fullName,
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
        }

        // Show confirmation again for unexpected input
        const userInfo = session.collegeData.userInfo;
        const confirmationMessage = `Please Confirm Your Application Details\n\nPersonal Information:\nFull Name: ${userInfo.fullName}\nChurch/Company: ${userInfo.churchName}\nEmail: ${userInfo.email}\nPhone: ${userInfo.phone}\n\n1. Confirm - Submit your application\n2. Edit - Modify information\n3. Cancel - Cancel application\n\nPlease select an option (1, 2, or 3):`;

        return {
            type: 'message',
            content: confirmationMessage
        };
    }

    // Create college application via API call
    async createCollegeApplicationViaAPI(session, phoneNumber) {
        try {
            const userInfo = session.collegeData.userInfo || {};
            
            // Prepare application data for API
            const applicationData = {
                applicantName: userInfo.fullName || 'Not provided',
                churchName: userInfo.churchName || 'Not provided',
                email: userInfo.email || 'Not provided',
                phoneNumber: userInfo.phone || 'Not provided',
                whatsappNumber: phoneNumber,
                serviceType: 'College Registration',
                status: 'Pending',
                applicationDate: new Date().toISOString()
            };
            
            this.debug('Calling API to create college registration application', {
                url: `${this.API_BASE_URL}/college_applications`,
                data: applicationData
            });
            
            // Make API call - adjust the endpoint as needed
            const response = await axios.post(`${this.API_BASE_URL}/college_applications`, applicationData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            if (response.data.success) {
                this.debug('College registration application created successfully via API', {
                    applicationId: response.data.data._id
                });
                
                return {
                    success: true,
                    applicationId: response.data.data._id,
                    referenceNumber: response.data.data.referenceNumber || `COL${new Date().getFullYear()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
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
            
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Unknown error occurred'
            };
        }
    }

    // Handle success template state
    async handleSuccessTemplate(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        if (userInput === 'done' || userInput === 'finish' || userInput === 'thank you' || userInput === '1') {
            session.state = this.COLLEGE_STATES.COLLEGE_END;
            session.collegeData.step = 'completed';
            session.collegeData.completedAt = new Date().toISOString();

            return {
                type: 'message',
                content: `College Registration Application Complete!\n\nYour application has been successfully submitted.\n\nNext Steps:\n1. Our admissions team will review your application\n2. We'll contact you within 5-7 business days\n3. You'll receive admission decision via email\n\n1. Start - New application\n2. Menu - Main services\n\nPlease select 1 or 2:`
            };
        }

        if (userInput === 'back' || userInput === 'menu' || userInput === '2') {
            return {
                type: 'message',
                content: `Returning to main menu...\n\nType 'menu' to see main services.`
            };
        }

        // If user sends other input, provide completion instructions
        return {
            type: 'message',
            content: `Your college registration application has been submitted successfully!\n\n1. Done - Complete process\n2. Menu - Return to main services\n\nPlease select 1 or 2:`
        };
    }

    // Handle college end state
    async handleCollegeEnd(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        if (userInput === 'start' || userInput === '1') {
            delete session.collegeData;
            session.state = 'main_menu';
            
            return {
                type: 'message',
                content: `Starting new process...\n\nType 'menu' to see all available services.`
            };
        }

        if (userInput === 'menu' || userInput === '2') {
            delete session.collegeData;
            session.state = 'main_menu';
            
            return {
                type: 'message',
                content: `Returning to main menu...\n\nType 'menu' to see main services.`
            };
        }

        return {
            type: 'message',
            content: `Your college registration application is complete!\n\n1. Start - New application\n2. Menu - Main services\n\nPlease select 1 or 2:`
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

    // Get college registration summary
    getCollegeSummary(session) {
        if (!session.collegeData) return null;

        return {
            step: session.collegeData.step,
            startTime: session.collegeData.startTime,
            applicationStatus: session.collegeData.applicationStatus,
            applicationId: session.collegeData.applicationId,
            userInfo: session.collegeData.userInfo || {},
            applicationSubmitted: session.collegeData.applicationSubmitted,
            completedAt: session.collegeData.completedAt,
            currentState: session.state
        };
    }

    // Calculate progress percentage
    calculateProgress(session) {
        if (!session.collegeData) return 0;

        const stateProgress = {
            [this.COLLEGE_STATES.QUICK_REPLY_TEMPLATE]: 10,
            [this.COLLEGE_STATES.COLLECT_FULL_NAME]: 20,
            [this.COLLEGE_STATES.COLLECT_CHURCH_NAME]: 40,
            [this.COLLEGE_STATES.COLLECT_EMAIL]: 60,
            [this.COLLEGE_STATES.COLLECT_PHONE]: 80,
            [this.COLLEGE_STATES.CONFIRM_APPLICATION]: 90,
            [this.COLLEGE_STATES.SUCCESS_TEMPLATE]: 95,
            [this.COLLEGE_STATES.COLLEGE_END]: 100
        };

        return stateProgress[session.state] || 0;
    }
}

// Make sure to export the class correctly
module.exports = CollegeRegistrationFlow;