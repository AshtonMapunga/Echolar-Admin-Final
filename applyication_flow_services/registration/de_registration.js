const axios = require('axios');

class CompanyDeRegistrationFlow {
    constructor() {
        // De-registration specific states
        this.DEREGISTRATION_STATES = {
            DEREGISTRATION_START: 'deregistration_start',
            DEREGISTRATION_QUICK_REPLY: 'deregistration_quick_reply',
            REASON_COLLECTION: 'reason_collection',
            COMPANY_VERIFICATION: 'company_verification',
            OUTSTANDING_OBLIGATIONS_CHECK: 'outstanding_obligations_check',
            FINAL_CONFIRMATION: 'final_confirmation',
            COLLECT_COMPANY_INFO: 'collect_company_info',
            COLLECT_PERSONAL_INFO: 'collect_personal_info',
            DEREGISTRATION_CONFIRMATION: 'deregistration_confirmation',
            DEREGISTRATION_END: 'deregistration_end'
        };

        // Template IDs
        this.QUICK_REPLY_TEMPLATE = 'HX_deregistration_quick_reply'; // You'll need to create this template
        this.CONFIRMATION_TEMPLATE = 'HX_deregistration_confirmation'; // New confirmation template
        this.SUCCESS_TEMPLATE = 'HX_deregistration_success'; // New success template

        // API base URL
        this.API_BASE_URL = 'https://echolar-admin-final.onrender.com/api/v1';

        // Information collection fields
        this.COMPANY_INFO_FIELDS = [
            { key: 'companyName', label: '🏢 Company Name', prompt: 'Please provide your company name:' },
            { key: 'registrationNumber', label: '🔢 Registration Number', prompt: 'Please provide your company registration number:' },
            { key: 'businessType', label: '🏭 Business Type', prompt: 'Please specify your business type:' },
            { key: 'registrationDate', label: '📅 Date of Registration', prompt: 'Please provide your company registration date (YYYY-MM-DD):' }
        ];

        this.PERSONAL_INFO_FIELDS = [
            { key: 'contactName', label: '👤 Contact Person Name', prompt: 'Please provide the contact person\'s full name:' },
            { key: 'contactEmail', label: '📧 Email Address', prompt: 'Please provide your email address:' },
            { key: 'contactPhone', label: '📱 Phone Number', prompt: 'Please provide your phone number:' },
            { key: 'position', label: '💼 Position in Company', prompt: 'Please specify your position in the company:' },
            { key: 'authority', label: '✅ Authority to Act', prompt: 'Do you have authority to initiate de-registration? (yes/no):' }
        ];

        // Common reasons for de-registration
        this.DEREGISTRATION_REASONS = [
            'Business Closure',
            'Merger/Acquisition',
            'Restructuring',
            'Relocation Abroad',
            'Other'
        ];

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] DEREGISTRATION_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Check if current state is a de-registration state
    isDeRegistrationState(state) {
        return Object.values(this.DEREGISTRATION_STATES).includes(state);
    }

    // Start the company de-registration process
    async startCompanyDeRegistration(session, phoneNumber) {
        this.debug('Starting company de-registration flow', { phoneNumber });

        // Initialize de-registration data
        session.deregistrationData = {
            startTime: new Date().toISOString(),
            step: 'quick_reply',
            reason: null,
            hasOutstandingObligations: null,
            outstandingDetails: null,
            companyInfo: {},
            personalInfo: {},
            currentInfoField: 0,
            collectionPhase: 'company'
        };

        session.state = this.DEREGISTRATION_STATES.DEREGISTRATION_QUICK_REPLY;

        return {
            type: 'message',
            content: `🏢 *Company De-Registration Process*\n\nThis process will guide you through company de-registration.\n\n⚠️ *Important:* Before proceeding, ensure:\n• All taxes are paid up\n• No outstanding returns\n• No pending legal issues\n\nDo you want to proceed with company de-registration? (yes/no)`
        };
    }

    // Process de-registration input
    async processDeRegistrationInput(message, session, phoneNumber) {
        this.debug('Processing de-registration input', {
            phoneNumber,
            state: session.state,
            message,
            deregistrationData: session.deregistrationData
        });

        switch (session.state) {
            case this.DEREGISTRATION_STATES.DEREGISTRATION_QUICK_REPLY:
                return await this.handleQuickReply(message, session, phoneNumber);

            case this.DEREGISTRATION_STATES.REASON_COLLECTION:
                return await this.handleReasonCollection(message, session, phoneNumber);

            case this.DEREGISTRATION_STATES.OUTSTANDING_OBLIGATIONS_CHECK:
                return await this.handleObligationsCheck(message, session, phoneNumber);

            case this.DEREGISTRATION_STATES.COLLECT_COMPANY_INFO:
                return await this.handleCompanyInfoCollection(message, session, phoneNumber);

            case this.DEREGISTRATION_STATES.COLLECT_PERSONAL_INFO:
                return await this.handlePersonalInfoCollection(message, session, phoneNumber);

            case this.DEREGISTRATION_STATES.DEREGISTRATION_CONFIRMATION:
                return await this.handleDeRegistrationConfirmation(message, session, phoneNumber);

            case this.DEREGISTRATION_STATES.DEREGISTRATION_END:
                return await this.handleDeRegistrationEnd(message, session, phoneNumber);

            default:
                return await this.handleDefault(message, session, phoneNumber);
        }
    }

    // Handle quick reply response
    async handleQuickReply(message, session, phoneNumber) {
        const userInput = message.toLowerCase().trim();

        if (userInput === 'yes' || userInput === 'y') {
            session.state = this.DEREGISTRATION_STATES.REASON_COLLECTION;
            return {
                type: 'message',
                content: `📋 *Reason for De-Registration*\n\nPlease select the main reason for de-registration:\n\n1. Business Closure\n2. Merger/Acquisition\n3. Restructuring\n4. Relocation Abroad\n5. Other\n\nPlease enter the number of your choice:`
            };
        }

        if (userInput === 'no' || userInput === 'n') {
            return {
                type: 'message',
                content: `❌ De-registration process cancelled.\n\n🔄 Type 'menu' to return to main services or 'start' to begin a new process.`
            };
        }

        return {
            type: 'message',
            content: `Please respond with 'yes' to proceed or 'no' to cancel the de-registration process.`
        };
    }

    // Handle reason collection
    async handleReasonCollection(message, session, phoneNumber) {
        const userInput = message.trim();
        const reasonNumber = parseInt(userInput);

        if (isNaN(reasonNumber) || reasonNumber < 1 || reasonNumber > 5) {
            return {
                type: 'message',
                content: `❌ Please enter a valid number between 1-5:\n\n1. Business Closure\n2. Merger/Acquisition\n3. Restructuring\n4. Relocation Abroad\n5. Other`
            };
        }

        const reason = this.DEREGISTRATION_REASONS[reasonNumber - 1];
        session.deregistrationData.reason = reason;
        session.state = this.DEREGISTRATION_STATES.OUTSTANDING_OBLIGATIONS_CHECK;

        return {
            type: 'message',
            content: `✅ Reason recorded: ${reason}\n\n📋 *Outstanding Obligations Check*\n\nDo you have any outstanding obligations?\n• Unpaid taxes\n• Pending annual returns\n• Legal disputes\n• Employee issues\n\nPlease respond with 'yes' or 'no':`
        };
    }

    // Handle obligations check
    async handleObligationsCheck(message, session, phoneNumber) {
        const userInput = message.toLowerCase().trim();

        if (userInput === 'yes' || userInput === 'y') {
            session.deregistrationData.hasOutstandingObligations = true;
            return {
                type: 'message',
                content: `⚠️ *Outstanding Obligations*\n\nPlease provide details of outstanding obligations:\n\n• Type of obligation (taxes, returns, etc.)\n• Amount outstanding (if applicable)\n• Time period\n\nPlease describe:`
            };
        }

        if (userInput === 'no' || userInput === 'n') {
            session.deregistrationData.hasOutstandingObligations = false;
            session.state = this.DEREGISTRATION_STATES.COLLECT_COMPANY_INFO;
            session.deregistrationData.currentInfoField = 0;
            session.deregistrationData.collectionPhase = 'company';

            const firstField = this.COMPANY_INFO_FIELDS[0];
            return {
                type: 'message',
                content: `✅ No outstanding obligations noted.\n\n📋 Now let's collect your company information.\n\n${firstField.label}\n${firstField.prompt}`
            };
        }

        return {
            type: 'message',
            content: `Please respond with 'yes' if you have outstanding obligations or 'no' if you don't.`
        };
    }

    // Handle company information collection
    async handleCompanyInfoCollection(message, session, phoneNumber) {
        // If we're collecting obligation details first
        if (session.deregistrationData.hasOutstandingObligations && 
            !session.deregistrationData.outstandingDetails) {
            session.deregistrationData.outstandingDetails = message;
            session.state = this.DEREGISTRATION_STATES.COLLECT_COMPANY_INFO;
            session.deregistrationData.currentInfoField = 0;
            session.deregistrationData.collectionPhase = 'company';

            const firstField = this.COMPANY_INFO_FIELDS[0];
            return {
                type: 'message',
                content: `✅ Outstanding obligations noted.\n\n📋 Now let's collect your company information.\n\n${firstField.label}\n${firstField.prompt}`
            };
        }

        const userInput = message.trim();
        const currentFieldIndex = session.deregistrationData.currentInfoField;
        const field = this.COMPANY_INFO_FIELDS[currentFieldIndex];

        if (userInput.length === 0) {
            return {
                type: 'message',
                content: `Please provide the required information.\n\n${field.label}\n${field.prompt}`
            };
        }

        // Special validation for registration date
        if (field.key === 'registrationDate') {
            if (!this.isValidDate(userInput)) {
                return {
                    type: 'message',
                    content: `❌ Please provide a valid date in YYYY-MM-DD format.\n\n${field.prompt}`
                };
            }
        }

        // Store the information
        session.deregistrationData.companyInfo[field.key] = userInput;
        session.deregistrationData.currentInfoField++;

        // Check if we've collected all company information
        if (session.deregistrationData.currentInfoField >= this.COMPANY_INFO_FIELDS.length) {
            // Move to personal information collection
            session.state = this.DEREGISTRATION_STATES.COLLECT_PERSONAL_INFO;
            session.deregistrationData.currentInfoField = 0;
            session.deregistrationData.collectionPhase = 'personal';

            const firstPersonalField = this.PERSONAL_INFO_FIELDS[0];
            return {
                type: 'message',
                content: `✅ Company information collected!\n\n👤 Now let's collect your personal information.\n\n${firstPersonalField.label}\n${firstPersonalField.prompt}`
            };
        }

        // Ask for next company field
        const nextField = this.COMPANY_INFO_FIELDS[session.deregistrationData.currentInfoField];
        return {
            type: 'message',
            content: `✅ Got it!\n\n${nextField.label}\n${nextField.prompt}`
        };
    }

    // Handle personal information collection
    async handlePersonalInfoCollection(message, session, phoneNumber) {
        const userInput = message.trim();
        const currentFieldIndex = session.deregistrationData.currentInfoField;
        const field = this.PERSONAL_INFO_FIELDS[currentFieldIndex];

        if (userInput.length === 0) {
            return {
                type: 'message',
                content: `Please provide the required information.\n\n${field.label}\n${field.prompt}`
            };
        }

        // Special validation for authority field
        if (field.key === 'authority') {
            const authInput = userInput.toLowerCase();
            if (authInput !== 'yes' && authInput !== 'no' && authInput !== 'y' && authInput !== 'n') {
                return {
                    type: 'message',
                    content: `❌ Please respond with 'yes' or 'no'.\n\n${field.prompt}`
                };
            }
            session.deregistrationData.personalInfo[field.key] = authInput;
        } else {
            session.deregistrationData.personalInfo[field.key] = userInput;
        }

        session.deregistrationData.currentInfoField++;

        // Check if we've collected all personal information
        if (session.deregistrationData.currentInfoField >= this.PERSONAL_INFO_FIELDS.length) {
            // Move to confirmation
            session.state = this.DEREGISTRATION_STATES.DEREGISTRATION_CONFIRMATION;
            return this.generateDeRegistrationConfirmationText(session);
        }

        // Ask for next personal field
        const nextField = this.PERSONAL_INFO_FIELDS[session.deregistrationData.currentInfoField];
        return {
            type: 'message',
            content: `✅ Thank you!\n\n${nextField.label}\n${nextField.prompt}`
        };
    }

    // Handle de-registration confirmation
    async handleDeRegistrationConfirmation(message, session, phoneNumber) {
        const userInput = message.toLowerCase().trim();

        if (userInput === 'confirm' || userInput === 'yes' || userInput === '1') {
            // Create application via API call
            try {
                const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                
                if (applicationResult.success) {
                    session.state = this.DEREGISTRATION_STATES.DEREGISTRATION_END;
                    session.deregistrationData.step = 'completed';
                    session.deregistrationData.applicationId = applicationResult.applicationId;

                    return {
                        type: 'message',
                        content: `✅ *De-Registration Application Submitted*\n\n📋 Application ID: ${applicationResult.applicationId}\n\nYour company de-registration application has been received.\n\n📞 Our team will contact you within 2-3 business days to discuss the process, requirements, and timeline.\n\n⚠️ *Note:* De-registration typically takes 4-6 weeks and requires:\n• Submission of final tax returns\n• Clearance from relevant authorities\n• Publication of notice in government gazette\n\nThank you for using our services.`
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

        if (userInput === 'edit' || userInput === 'modify' || userInput === '2') {
            // Reset to company information collection
            session.state = this.DEREGISTRATION_STATES.COLLECT_COMPANY_INFO;
            session.deregistrationData.currentInfoField = 0;
            session.deregistrationData.collectionPhase = 'company';
            session.deregistrationData.companyInfo = {};
            session.deregistrationData.personalInfo = {};

            const firstField = this.COMPANY_INFO_FIELDS[0];
            return {
                type: 'message',
                content: `📝 Let's collect your information again.\n\n${firstField.label}\n${firstField.prompt}`
            };
        }

        if (userInput === 'cancel' || userInput === '3') {
            return {
                type: 'message',
                content: `❌ Company de-registration application cancelled.\n\n🔄 Type 'start' to begin again or 'menu' for main services.`
            };
        }

        if (userInput === 'retry') {
            // Try to create application again
            try {
                const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                
                if (applicationResult.success) {
                    session.state = this.DEREGISTRATION_STATES.DEREGISTRATION_END;
                    session.deregistrationData.step = 'completed';
                    session.deregistrationData.applicationId = applicationResult.applicationId;

                    return {
                        type: 'message',
                        content: `✅ *De-Registration Application Submitted*\n\n📋 Application ID: ${applicationResult.applicationId}\n\nYour application has been successfully submitted.`
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

        // Show confirmation again for unexpected input
        return this.generateDeRegistrationConfirmationText(session);
    }

    // Create application via API call
    async createApplicationViaAPI(session, phoneNumber) {
        try {
            const companyInfo = session.deregistrationData.companyInfo || {};
            const personalInfo = session.deregistrationData.personalInfo || {};
            
            // Prepare application data for API
            const applicationData = {
                applicantName: personalInfo.contactName || 'Not provided',
                applicantEmail: personalInfo.contactEmail || 'Not provided',
                applicantPhone: phoneNumber,
                serviceType: 'Company De-Registration',
                status: 'Pending',
                companyName: companyInfo.companyName || 'Not provided',
                businessType: companyInfo.businessType || 'Not provided',
                registrationNumber: companyInfo.registrationNumber || 'Not provided',
                registrationDate: companyInfo.registrationDate || 'Not provided',
                positionInCompany: personalInfo.position || 'Not provided',
                authorityToAct: personalInfo.authority || 'Not provided',
                deregistrationReason: session.deregistrationData.reason || 'Not provided',
                hasOutstandingObligations: session.deregistrationData.hasOutstandingObligations || false,
                outstandingDetails: session.deregistrationData.outstandingDetails || 'None'
            };
            
            this.debug('Calling API to create de-registration application', {
                url: `${this.API_BASE_URL}/comp_de_reg_applications`,
                data: applicationData
            });
            
            // Make API call
            const response = await axios.post(`${this.API_BASE_URL}/comp_de_reg_applications`, applicationData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            if (response.data.success) {
                this.debug('De-registration application created successfully via API', {
                    applicationId: response.data.data._id
                });
                
                return {
                    success: true,
                    applicationId: response.data.data._id,
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

    // Handle de-registration end state
    async handleDeRegistrationEnd(message, session, phoneNumber) {
        const userInput = message.toLowerCase().trim();

        if (userInput === 'start' || userInput === 'menu') {
            // Reset session and return to main menu
            delete session.deregistrationData;
            session.state = 'main_menu';
            
            return {
                type: 'message',
                content: `🔄 Returning to main menu...\n\nType 'menu' to see all available services.`
            };
        }

        return {
            type: 'message',
            content: `🎉 Your company de-registration application has been submitted!\n\n🔄 Type 'start' to begin a new application or 'menu' for main services.`
        };
    }

    // Handle default/fallback for de-registration
    async handleDefault(message, session, phoneNumber) {
        const userInput = message.toLowerCase().trim();

        if (userInput === 'back' || userInput === 'menu') {
            return {
                type: 'message',
                content: `🔄 Returning to main menu...\n\nType 'menu' to see main services.`
            };
        }

        if (userInput === 'help') {
            return {
                type: 'message',
                content: `🆘 *Company De-Registration Help*\n\nYou are currently in: ${session.state}\n\nAvailable commands:\n• 'back' or 'menu' - Return to main menu\n• 'help' - Show this help\n• 'reset' - Start over\n\nPlease follow the prompts or use the commands above.`
            };
        }

        return {
            type: 'message',
            content: `❓ I didn't understand that. Please follow the prompts or type 'help' for assistance.`
        };
    }

    // Generate de-registration confirmation text
    generateDeRegistrationConfirmationText(session) {
        const companyInfo = session.deregistrationData.companyInfo || {};
        const personalInfo = session.deregistrationData.personalInfo || {};
        
        let message = `📋 *Please Confirm Your Company De-Registration Details*\n\n`;
        
        message += `🏢 **Company Information:**\n`;
        message += `• Company Name: ${companyInfo.companyName || 'Not provided'}\n`;
        message += `• Registration Number: ${companyInfo.registrationNumber || 'Not provided'}\n`;
        message += `• Business Type: ${companyInfo.businessType || 'Not provided'}\n`;
        message += `• Registration Date: ${companyInfo.registrationDate || 'Not provided'}\n\n`;
        
        message += `👤 **Contact Information:**\n`;
        message += `• Name: ${personalInfo.contactName || 'Not provided'}\n`;
        message += `• Email: ${personalInfo.contactEmail || 'Not provided'}\n`;
        message += `• Phone: ${personalInfo.contactPhone || 'Not provided'}\n`;
        message += `• Position: ${personalInfo.position || 'Not provided'}\n`;
        message += `• Authority to Act: ${personalInfo.authority || 'Not provided'}\n\n`;

        message += `📝 **De-Registration Details:**\n`;
        message += `• Reason: ${session.deregistrationData.reason || 'Not provided'}\n`;
        message += `• Outstanding Obligations: ${session.deregistrationData.hasOutstandingObligations ? 'Yes' : 'No'}\n`;
        
        if (session.deregistrationData.hasOutstandingObligations) {
            message += `• Obligation Details: ${session.deregistrationData.outstandingDetails || 'Not provided'}\n\n`;
        } else {
            message += `• Obligation Details: None\n\n`;
        }

        message += `⚠️ *Important:* De-registration is a formal process that requires:\n`;
        message += `• Submission of final tax returns\n`;
        message += `• Clearance from ZIMRA, NSSA, and other authorities\n`;
        message += `• Publication of notice in government gazette\n`;
        message += `• Typically takes 4-6 weeks to complete\n\n`;

        message += `✅ Type 'confirm' to submit application\n`;
        message += `✏️ Type 'edit' to modify information\n`;
        message += `❌ Type 'cancel' to cancel application`;

        return {
            type: 'message',
            content: message
        };
    }

    // Helper method to validate date format
    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    // Get de-registration summary for admin/debugging
    getDeRegistrationSummary(session) {
        if (!session.deregistrationData) return null;

        return {
            step: session.deregistrationData.step,
            startTime: session.deregistrationData.startTime,
            companyName: session.deregistrationData.companyInfo?.companyName || 'Not provided',
            registrationNumber: session.deregistrationData.companyInfo?.registrationNumber || 'Not provided',
            contactName: session.deregistrationData.personalInfo?.contactName || 'Not provided',
            reason: session.deregistrationData.reason,
            hasOutstandingObligations: session.deregistrationData.hasOutstandingObligations,
            currentState: session.state,
            applicationId: session.deregistrationData.applicationId || 'Not created'
        };
    }

    // Calculate progress percentage
    calculateProgress(session) {
        if (!session.deregistrationData) return 0;

        const stateProgress = {
            [this.DEREGISTRATION_STATES.DEREGISTRATION_QUICK_REPLY]: 10,
            [this.DEREGISTRATION_STATES.REASON_COLLECTION]: 25,
            [this.DEREGISTRATION_STATES.OUTSTANDING_OBLIGATIONS_CHECK]: 40,
            [this.DEREGISTRATION_STATES.COLLECT_COMPANY_INFO]: 60,
            [this.DEREGISTRATION_STATES.COLLECT_PERSONAL_INFO]: 80,
            [this.DEREGISTRATION_STATES.DEREGISTRATION_CONFIRMATION]: 95,
            [this.DEREGISTRATION_STATES.DEREGISTRATION_END]: 100
        };

        return stateProgress[session.state] || 0;
    }
}

module.exports = CompanyDeRegistrationFlow;