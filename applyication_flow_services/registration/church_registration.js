const axios = require('axios');

class ChurchRegistrationFlow {
    constructor() {
        // Church registration specific states
        this.CHURCH_STATES = {
            CHURCH_START: 'church_start',
            CHURCH_NAME: 'church_name',
            FOUNDER_DETAILS: 'founder_details',
            FOUNDER_NAME: 'founder_name',
            FOUNDER_ID: 'founder_id',
            FOUNDER_ADDRESS: 'founder_address',
            FOUNDER_CONTACT: 'founder_contact',
            ADD_ANOTHER_FOUNDER: 'add_another_founder',
            CHURCH_OBJECTIVES: 'church_objectives',
            CONFIRM_DETAILS: 'confirm_church_details',
            CHURCH_SUBMISSION: 'church_submission',
            CHURCH_END: 'church_end'
        };

        // API base URL
        this.API_BASE_URL = 'https://chatbotbackend-1ox6.onrender.com/api/v1';

        // Founder information fields
        this.FOUNDER_FIELDS = [
            { key: 'name', label: '👤 Full Name', prompt: 'Please provide the full name of the founder:' },
            { key: 'idNumber', label: '🆔 ID Number', prompt: 'Please provide the ID number:' },
            { key: 'address', label: '🏠 Physical Address', prompt: 'Please provide the physical address:' },
            { key: 'contact', label: '📞 Contact Information', prompt: 'Please provide contact information (phone/email):' }
        ];

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] CHURCH_REGISTRATION_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Check if current state is a church registration state
    isChurchState(state) {
        return Object.values(this.CHURCH_STATES).includes(state);
    }

    // Start the church registration process
    async startChurchRegistration(session, phoneNumber) {
        this.debug('Starting church registration flow', { phoneNumber });

        // Initialize church registration data
        session.churchData = {
            startTime: new Date().toISOString(),
            step: 'church_name',
            applicationStatus: 'initiated',
            registrationFee: 650,
            founders: [],
            currentFounderIndex: 0,
            currentFounderField: 0,
            currentFounderData: {}
        };

        session.state = this.CHURCH_STATES.CHURCH_NAME;

        return {
            type: 'message',
            content: `⛪ *Church Registration Application*\n\nLet's start your church registration process. The registration fee is $650.\n\nPlease provide the name of your church:`
        };
    }

    // Process church registration input
    async processChurchInput(message, session, phoneNumber) {
        this.debug('Processing church registration input', {
            phoneNumber,
            state: session.state,
            message,
            churchData: session.churchData
        });

        switch (session.state) {
            case this.CHURCH_STATES.CHURCH_NAME:
                return await this.handleChurchName(message, session, phoneNumber);

            case this.CHURCH_STATES.FOUNDER_NAME:
                return await this.handleFounderName(message, session, phoneNumber);

            case this.CHURCH_STATES.FOUNDER_ID:
                return await this.handleFounderId(message, session, phoneNumber);

            case this.CHURCH_STATES.FOUNDER_ADDRESS:
                return await this.handleFounderAddress(message, session, phoneNumber);

            case this.CHURCH_STATES.FOUNDER_CONTACT:
                return await this.handleFounderContact(message, session, phoneNumber);

            case this.CHURCH_STATES.ADD_ANOTHER_FOUNDER:
                return await this.handleAddAnotherFounder(message, session, phoneNumber);

            case this.CHURCH_STATES.CHURCH_OBJECTIVES:
                return await this.handleChurchObjectives(message, session, phoneNumber);

            case this.CHURCH_STATES.CONFIRM_DETAILS:
                return await this.handleConfirmation(message, session, phoneNumber);

            case this.CHURCH_STATES.CHURCH_SUBMISSION:
                return await this.handleChurchSubmission(message, session, phoneNumber);

            case this.CHURCH_STATES.CHURCH_END:
                return await this.handleChurchEnd(message, session, phoneNumber);

            default:
                return await this.handleDefault(message, session, phoneNumber);
        }
    }

    // Handle church name collection
    async handleChurchName(message, session, phoneNumber) {
        const churchName = message.trim();

        if (churchName) {
            session.churchData.churchName = churchName;
            session.churchData.step = 'founder_details';
            session.state = this.CHURCH_STATES.FOUNDER_NAME;

            return {
                type: 'message',
                content: `✅ Church name recorded: *${churchName}*\n\n👤 Now let's collect details of the church founder(s).\n\nPlease provide the full name of the first founder:`
            };
        }

        return {
            type: 'message',
            content: `Please provide the name of your church to continue with the registration process.`
        };
    }

    // Handle founder name collection
    async handleFounderName(message, session, phoneNumber) {
        const founderName = message.trim();

        if (founderName) {
            session.churchData.currentFounderData = { name: founderName };
            session.state = this.CHURCH_STATES.FOUNDER_ID;

            return {
                type: 'message',
                content: `✅ Founder name recorded.\n\n🆔 Please provide the ID number for ${founderName}:`
            };
        }

        return {
            type: 'message',
            content: `Please provide the full name of the founder.`
        };
    }

    // Handle founder ID collection
    async handleFounderId(message, session, phoneNumber) {
        const idNumber = message.trim();

        if (idNumber) {
            session.churchData.currentFounderData.idNumber = idNumber;
            session.state = this.CHURCH_STATES.FOUNDER_ADDRESS;

            return {
                type: 'message',
                content: `✅ ID number recorded.\n\n🏠 Please provide the physical address for ${session.churchData.currentFounderData.name}:`
            };
        }

        return {
            type: 'message',
            content: `Please provide the ID number.`
        };
    }

    // Handle founder address collection
    async handleFounderAddress(message, session, phoneNumber) {
        const address = message.trim();

        if (address) {
            session.churchData.currentFounderData.address = address;
            session.state = this.CHURCH_STATES.FOUNDER_CONTACT;

            return {
                type: 'message',
                content: `✅ Address recorded.\n\n📞 Please provide contact information (phone/email) for ${session.churchData.currentFounderData.name}:`
            };
        }

        return {
            type: 'message',
            content: `Please provide the physical address.`
        };
    }

    // Handle founder contact collection
    async handleFounderContact(message, session, phoneNumber) {
        const contact = message.trim();

        if (contact) {
            session.churchData.currentFounderData.contact = contact;
            
            // Add completed founder to the list
            session.churchData.founders.push(session.churchData.currentFounderData);
            session.churchData.currentFounderData = {};
            
            session.state = this.CHURCH_STATES.ADD_ANOTHER_FOUNDER;

            return {
                type: 'message',
                content: `✅ Founder details completed!\n\nDo you want to add another founder? (yes/no)`
            };
        }

        return {
            type: 'message',
            content: `Please provide contact information.`
        };
    }

    // Handle adding another founder
    async handleAddAnotherFounder(message, session, phoneNumber) {
        const userInput = message.toLowerCase().trim();

        if (userInput === 'yes' || userInput === 'y') {
            session.state = this.CHURCH_STATES.FOUNDER_NAME;
            return {
                type: 'message',
                content: `👤 Please provide the full name of the next founder:`
            };
        }

        if (userInput === 'no' || userInput === 'n') {
            session.state = this.CHURCH_STATES.CHURCH_OBJECTIVES;
            return {
                type: 'message',
                content: `✅ Founder details completed.\n\n📋 Now please describe the objectives and mission of your church. These must be lawful and compliant with local regulations:\n\n• Religious activities\n• Community services\n• Educational programs\n• Charitable work\n\nPlease provide a comprehensive description:`
            };
        }

        return {
            type: 'message',
            content: `Please respond with 'yes' to add another founder or 'no' to continue.`
        };
    }

    // Handle church objectives collection
    async handleChurchObjectives(message, session, phoneNumber) {
        const objectives = message.trim();

        if (objectives) {
            session.churchData.objectives = objectives;
            session.churchData.step = 'confirmation';
            session.state = this.CHURCH_STATES.CONFIRM_DETAILS;

            return this.generateChurchConfirmationMessage(session);
        }

        return {
            type: 'message',
            content: `Please describe the lawful objectives and mission of your church to continue.`
        };
    }

    // Handle confirmation
    async handleConfirmation(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        if (userInput === 'confirm' || userInput === 'yes') {
            session.churchData.step = 'submission';
            session.state = this.CHURCH_STATES.CHURCH_SUBMISSION;
            session.churchData.confirmedAt = new Date().toISOString();

            return {
                type: 'message',
                content: `✅ Application details confirmed!\n\n💳 Registration Fee: $650\n\nPlease make payment using your preferred method and then type 'submit' to finalize your application.\n\nAfter submission, our team will contact you for payment verification.`
            };
        }

        if (userInput === 'edit' || userInput === 'modify') {
            session.churchData.step = 'church_name';
            session.state = this.CHURCH_STATES.CHURCH_NAME;
            // Clear previous data to start over
            session.churchData.churchName = null;
            session.churchData.founders = [];
            session.churchData.objectives = null;

            return {
                type: 'message',
                content: `📝 Let's start over with your church registration.\n\nPlease provide the name of your church:`
            };
        }

        if (userInput === 'cancel') {
            delete session.churchData;
            session.state = 'main_menu';
            
            return {
                type: 'message',
                content: `❌ Church registration cancelled.\n\n🔄 Type 'menu' to see main services or 'start' to begin a new application.`
            };
        }

        if (userInput === 'submit') {
            // Allow direct submission from confirmation
            return await this.handleChurchSubmission('submit', session, phoneNumber);
        }

        return this.generateChurchConfirmationMessage(session);
    }

    // Handle church submission
    async handleChurchSubmission(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        if (userInput === 'submit') {
            try {
                const applicationResult = await this.createChurchApplicationViaAPI(session, phoneNumber);
                
                if (applicationResult.success) {
                    session.churchData.step = 'completed';
                    session.state = this.CHURCH_STATES.CHURCH_END;
                    session.churchData.applicationId = applicationResult.applicationId;
                    session.churchData.referenceNumber = applicationResult.referenceNumber;

                    return {
                        type: 'message',
                        content: `🎉 *Church Registration Application Submitted Successfully!*\n\n📋 Application ID: ${applicationResult.applicationId}\n⛪ Church Name: ${session.churchData.churchName}\n💳 Registration Fee: $650\n\n✅ Your application has been received and is being processed.\n\n📞 Our registration team will contact you within 3-5 business days to verify your payment and complete the registration process.\n\n🔄 Type 'menu' for main services or 'start' for a new application.`
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
        }

        if (userInput === 'retry') {
            // Try to create application again
            try {
                const applicationResult = await this.createChurchApplicationViaAPI(session, phoneNumber);
                
                if (applicationResult.success) {
                    session.churchData.step = 'completed';
                    session.state = this.CHURCH_STATES.CHURCH_END;
                    session.churchData.applicationId = applicationResult.applicationId;

                    return {
                        type: 'message',
                        content: `✅ *Church Registration Application Submitted*\n\n📋 Application ID: ${applicationResult.applicationId}\n\nYour application has been successfully submitted.`
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
        }

        return {
            type: 'message',
            content: `💳 Please type 'submit' to finalize your church registration application after making payment.\n\nTo review your application, type 'back'.`
        };
    }

    // Create church application via API call
    async createChurchApplicationViaAPI(session, phoneNumber) {
        try {
            const churchData = session.churchData || {};
            
            // Prepare application data for API
            const applicationData = {
                churchName: churchData.churchName || 'Not provided',
                objectives: churchData.objectives || 'Not provided',
                registrationFee: churchData.registrationFee || 650,
                founders: churchData.founders || [],
                applicantPhone: phoneNumber,
                serviceType: 'Church Registration',
                status: 'Pending Payment Verification',
                applicationDate: new Date().toISOString()
            };
            
            this.debug('Calling API to create church registration application', {
                url: `${this.API_BASE_URL}/church_applications`,
                data: applicationData
            });
            
            // Make API call - adjust the endpoint as needed
            const response = await axios.post(`${this.API_BASE_URL}/church_reg_apply`, applicationData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            if (response.data.success) {
                this.debug('Church registration application created successfully via API', {
                    applicationId: response.data.data._id
                });
                
                return {
                    success: true,
                    applicationId: response.data.data._id,
                    referenceNumber: response.data.data.referenceNumber || `CH${new Date().getFullYear()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
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

    // Handle church end state
    async handleChurchEnd(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        if (userInput === 'menu' || userInput === 'start') {
            delete session.churchData;
            session.state = 'main_menu';
            
            return {
                type: 'message',
                content: `🔄 Returning to main menu...\n\nType 'menu' to see all available services.`
            };
        }

        return {
            type: 'message',
            content: `🎉 Your church registration application is complete!\n\nWe'll contact you shortly regarding the status of your application.\n\n🔄 Type 'menu' for main services or 'start' for a new application.`
        };
    }

    // Handle default/fallback
    async handleDefault(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        if (userInput === 'back' || userInput === 'menu') {
            return {
                type: 'message',
                content: `🔄 Returning to main menu...\n\nType 'menu' to see main services.`
            };
        }

        if (userInput === 'help') {
            return {
                type: 'message',
                content: `🆘 *Church Registration Help*\n\nYou are currently in: ${session.state}\n\nAvailable commands:\n• 'back' or 'menu' - Return to main menu\n• 'help' - Show this help\n• 'cancel' - Cancel registration\n\nPlease follow the prompts to complete your church registration.`
            };
        }

        return {
            type: 'message',
            content: `❓ I didn't understand that. Please follow the prompts or type 'help' for assistance.`
        };
    }

    // Generate church confirmation message
    generateChurchConfirmationMessage(session) {
        let message = `⛪ *Please Confirm Your Church Registration Details*\n\n`;
        message += `🔹 Church Name: ${session.churchData.churchName || 'Not provided'}\n\n`;
        
        message += `👤 **Founder Details:**\n`;
        session.churchData.founders.forEach((founder, index) => {
            message += `Founder ${index + 1}:\n`;
            message += `• Name: ${founder.name || 'Not provided'}\n`;
            message += `• ID: ${founder.idNumber || 'Not provided'}\n`;
            message += `• Address: ${founder.address || 'Not provided'}\n`;
            message += `• Contact: ${founder.contact || 'Not provided'}\n\n`;
        });
        
        message += `📋 **Church Objectives:**\n`;
        message += `${session.churchData.objectives || 'Not provided'}\n\n`;
        
        message += `💳 Registration Fee: $650\n\n`;
        message += `✅ Type 'confirm' to proceed\n`;
        message += `📤 Type 'submit' to submit application\n`;
        message += `✏️ Type 'edit' to modify information\n`;
        message += `❌ Type 'cancel' to cancel registration`;

        return {
            type: 'message',
            content: message
        };
    }

    // Get church registration summary
    getChurchSummary(session) {
        if (!session.churchData) return null;

        return {
            churchName: session.churchData.churchName,
            step: session.churchData.step,
            startTime: session.churchData.startTime,
            registrationFee: session.churchData.registrationFee,
            applicationStatus: session.churchData.applicationStatus,
            referenceNumber: session.churchData.referenceNumber,
            applicationId: session.churchData.applicationId,
            confirmedAt: session.churchData.confirmedAt,
            foundersCount: session.churchData.founders?.length || 0,
            currentState: session.state
        };
    }

    // Calculate progress percentage
    calculateProgress(session) {
        if (!session.churchData) return 0;

        const stateProgress = {
            [this.CHURCH_STATES.CHURCH_START]: 0,
            [this.CHURCH_STATES.CHURCH_NAME]: 10,
            [this.CHURCH_STATES.FOUNDER_NAME]: 20,
            [this.CHURCH_STATES.FOUNDER_ID]: 30,
            [this.CHURCH_STATES.FOUNDER_ADDRESS]: 40,
            [this.CHURCH_STATES.FOUNDER_CONTACT]: 50,
            [this.CHURCH_STATES.ADD_ANOTHER_FOUNDER]: 60,
            [this.CHURCH_STATES.CHURCH_OBJECTIVES]: 70,
            [this.CHURCH_STATES.CONFIRM_DETAILS]: 80,
            [this.CHURCH_STATES.CHURCH_SUBMISSION]: 90,
            [this.CHURCH_STATES.CHURCH_END]: 100
        };

        return stateProgress[session.state] || 0;
    }
}

module.exports = ChurchRegistrationFlow;