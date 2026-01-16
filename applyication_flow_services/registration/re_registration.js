const axios = require('axios');

class CompanyReRegistrationFlow {
    constructor() {
        // Re-registration specific states
        this.REREGISTRATION_STATES = {
            REREGISTRATION_START: 'reregistration_start',
            REREGISTRATION_QUICK_REPLY: 'reregistration_quick_reply',
            OUTSTANDING_RETURNS_CHECK: 'outstanding_returns_check',
            YEARS_COLLECTION: 'years_collection',
            QUOTE_GENERATION: 'quote_generation',
            QUOTE_CONFIRMATION: 'quote_confirmation',
            STANDARD_PROCESS: 'standard_process',
            COLLECT_COMPANY_INFO: 'collect_company_info',
            COLLECT_PERSONAL_INFO: 'collect_personal_info',
            REREGISTRATION_CONFIRMATION: 'reregistration_confirmation',
            REREGISTRATION_END: 'reregistration_end'
        };

        // Template IDs
        this.QUICK_REPLY_TEMPLATE = 'HX04c8e428f3b572f7040f4d09d9e45219';
        this.CONFIRMATION_TEMPLATE = 'HXa8debf9600e88e840ec32a207f74bdcc';
        this.SUCCESS_TEMPLATE = 'HXad745963c11831d86f95a16e9227fc7d';

        // Annual return fee per year
        this.ANNUAL_RETURN_FEE = 50;

        // API base URL
        this.API_BASE_URL = 'https://echolar-admin-final.onrender.com/api/v1';

        // Information collection fields (updated without icons)
        this.COMPANY_INFO_FIELDS = [
            { key: 'companyName', label: 'Company Name', prompt: 'Please provide your company name:' },
            { key: 'registrationNumber', label: 'Registration Number', prompt: 'Please provide your company registration number:' },
            { key: 'businessType', label: 'Business Type', prompt: 'Please specify your business type (e.g., Private Limited, Public Limited, etc.):' },
            { key: 'currentAddress', label: 'Current Business Address', prompt: 'Please provide your current business address:' }
        ];

        this.PERSONAL_INFO_FIELDS = [
            { key: 'contactName', label: 'Contact Person Name', prompt: 'Please provide the contact person\'s full name:' },
            { key: 'contactEmail', label: 'Email Address', prompt: 'Please provide your email address:' },
            { key: 'contactPhone', label: 'Phone Number', prompt: 'Please provide your phone number:' },
            { key: 'position', label: 'Position in Company', prompt: 'Please specify your position in the company:' }
        ];

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] REREGISTRATION_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Check if current state is a re-registration state
    isReRegistrationState(state) {
        return Object.values(this.REREGISTRATION_STATES).includes(state);
    }

    // Start the company re-registration process
    async startCompanyReRegistration(session, phoneNumber) {
        this.debug('Starting company re-registration flow', { phoneNumber });

        // Initialize re-registration data
        session.reregistrationData = {
            startTime: new Date().toISOString(),
            step: 'quick_reply',
            outstandingYears: null,
            quoteAmount: 0,
            companyInfo: {},
            personalInfo: {},
            currentInfoField: 0,
            collectionPhase: 'company'
        };

        session.state = this.REREGISTRATION_STATES.REREGISTRATION_QUICK_REPLY;

        return {
            type: 'template',
            templateSid: this.QUICK_REPLY_TEMPLATE,
            variables: {}
        };
    }

    // Process re-registration input
    async processReRegistrationInput(message, session, phoneNumber) {
        this.debug('Processing re-registration input', {
            phoneNumber,
            state: session.state,
            message,
            reregistrationData: session.reregistrationData
        });

        switch (session.state) {
            case this.REREGISTRATION_STATES.REREGISTRATION_QUICK_REPLY:
                return await this.handleQuickReply(message, session, phoneNumber);

            case this.REREGISTRATION_STATES.OUTSTANDING_RETURNS_CHECK:
                return await this.handleOutstandingReturnsCheck(message, session, phoneNumber);

            case this.REREGISTRATION_STATES.YEARS_COLLECTION:
                return await this.handleYearsCollection(message, session, phoneNumber);

            case this.REREGISTRATION_STATES.QUOTE_CONFIRMATION:
                return await this.handleQuoteConfirmation(message, session, phoneNumber);

            case this.REREGISTRATION_STATES.COLLECT_COMPANY_INFO:
                return await this.handleCompanyInfoCollection(message, session, phoneNumber);

            case this.REREGISTRATION_STATES.COLLECT_PERSONAL_INFO:
                return await this.handlePersonalInfoCollection(message, session, phoneNumber);

            case this.REREGISTRATION_STATES.REREGISTRATION_CONFIRMATION:
                return await this.handleReRegistrationConfirmation(message, session, phoneNumber);

            case this.REREGISTRATION_STATES.REREGISTRATION_END:
                return await this.handleReRegistrationEnd(message, session, phoneNumber);

            default:
                return await this.handleDefault(message, session, phoneNumber);
        }
    }

    // Handle quick reply response
    async handleQuickReply(message, session, phoneNumber) {
        const userInput = message.toLowerCase().trim();

        // Handle "No" response - proceed with standard re-registration
        if (userInput === 'no' || userInput === '2') {
            session.state = this.REREGISTRATION_STATES.COLLECT_COMPANY_INFO;
            session.reregistrationData.step = 'standard_process';
            session.reregistrationData.currentInfoField = 0;
            session.reregistrationData.collectionPhase = 'company';

            const firstField = this.COMPANY_INFO_FIELDS[0];
            return {
                type: 'message',
                content: `Company Re-Registration Process\n\nLet's collect your company information.\n\n${firstField.prompt}`
            };
        }

        // Handle "Yes" response - check for outstanding returns
        if (userInput === 'yes' || userInput === '1') {
            session.state = this.REREGISTRATION_STATES.YEARS_COLLECTION;
            session.reregistrationData.step = 'outstanding_returns';

            return {
                type: 'message',
                content: `To calculate your quote for outstanding annual returns:\n\nPlease tell me how many years of annual returns are outstanding?\n\nExample: If you haven't filed since 2020 and it's now 2024, that would be 4 years\n\nPlease enter the number of years:`
            };
        }

        return {
            type: 'message',
            content: `Please select either:\n1. Yes\n2. No\n\nOr type 'back' to return to the previous menu.`
        };
    }

    // Handle years collection for outstanding returns
    async handleYearsCollection(message, session, phoneNumber) {
        const userInput = message.trim();
        const years = parseInt(userInput);

        if (isNaN(years) || years <= 0) {
            return {
                type: 'message',
                content: `Please enter a valid number of years (e.g., 1, 2, 3, etc.)\n\nHow many years of annual returns are outstanding?`
            };
        }

        if (years > 10) {
            return {
                type: 'message',
                content: `That seems like a lot of years (${years}). Please double-check and enter the correct number of outstanding years, or contact our support team for assistance.`
            };
        }

        // Calculate quote
        const quoteAmount = years * this.ANNUAL_RETURN_FEE;
        session.reregistrationData.outstandingYears = years;
        session.reregistrationData.quoteAmount = quoteAmount;
        session.state = this.REREGISTRATION_STATES.QUOTE_CONFIRMATION;

        return {
            type: 'message',
            content: `Quote for Outstanding Annual Returns\n\nDetails:\nYears Outstanding: ${years}\nCost per Year: ${this.ANNUAL_RETURN_FEE}\nTotal Amount: ${quoteAmount}\n\n1. Accept - Proceed with this quote\n2. Modify - Change the number of years\n3. Cancel - Cancel this quote\n\nPlease select an option (1, 2, or 3):`
        };
    }

    // Handle quote confirmation
    async handleQuoteConfirmation(message, session, phoneNumber) {
        const userInput = message.toLowerCase().trim();

        if (userInput === 'accept' || userInput === '1') {
            // Move to company information collection
            session.state = this.REREGISTRATION_STATES.COLLECT_COMPANY_INFO;
            session.reregistrationData.currentInfoField = 0;
            session.reregistrationData.collectionPhase = 'company';

            const firstField = this.COMPANY_INFO_FIELDS[0];
            return {
                type: 'message',
                content: `Quote accepted! Total: ${session.reregistrationData.quoteAmount}\n\nNow let's collect your company information for the re-registration process.\n\n${firstField.prompt}`
            };
        }

        if (userInput === 'modify' || userInput === '2') {
            session.state = this.REREGISTRATION_STATES.YEARS_COLLECTION;
            return {
                type: 'message',
                content: `Please enter the correct number of years for outstanding annual returns:`
            };
        }

        if (userInput === 'cancel' || userInput === '3') {
            session.state = this.REREGISTRATION_STATES.REREGISTRATION_QUICK_REPLY;
            return {
                type: 'message',
                content: `Quote cancelled.\n\nWould you like to:\n1. Try again with a different number of years\n2. Proceed with standard re-registration (without outstanding returns)\n\nPlease select an option (1 or 2):`
            };
        }

        return {
            type: 'message',
            content: `Please choose one of the options:\n1. Accept - Proceed with quote (${session.reregistrationData.quoteAmount})\n2. Modify - Change number of years\n3. Cancel - Cancel quote\n\nPlease select 1, 2, or 3:`
        };
    }

    // Handle company information collection
    async handleCompanyInfoCollection(message, session, phoneNumber) {
        const userInput = message.trim();
        const currentFieldIndex = session.reregistrationData.currentInfoField;
        const field = this.COMPANY_INFO_FIELDS[currentFieldIndex];

        if (userInput.length === 0) {
            return {
                type: 'message',
                content: `Please provide the required information.\n\n${field.prompt}`
            };
        }

        // Store the information
        session.reregistrationData.companyInfo[field.key] = userInput;
        session.reregistrationData.currentInfoField++;

        // Check if we've collected all company information
        if (session.reregistrationData.currentInfoField >= this.COMPANY_INFO_FIELDS.length) {
            // Move to personal information collection
            session.state = this.REREGISTRATION_STATES.COLLECT_PERSONAL_INFO;
            session.reregistrationData.currentInfoField = 0;
            session.reregistrationData.collectionPhase = 'personal';

            const firstPersonalField = this.PERSONAL_INFO_FIELDS[0];
            return {
                type: 'message',
                content: `Company information collected!\n\nNow let's collect your personal information.\n\n${firstPersonalField.prompt}`
            };
        }

        // Ask for next company field
        const nextField = this.COMPANY_INFO_FIELDS[session.reregistrationData.currentInfoField];
        return {
            type: 'message',
            content: `Got it!\n\n${nextField.prompt}`
        };
    }

    // Handle personal information collection
    async handlePersonalInfoCollection(message, session, phoneNumber) {
        const userInput = message.trim();
        const currentFieldIndex = session.reregistrationData.currentInfoField;
        const field = this.PERSONAL_INFO_FIELDS[currentFieldIndex];

        if (userInput.length === 0) {
            return {
                type: 'message',
                content: `Please provide the required information.\n\n${field.prompt}`
            };
        }

        // Store the information
        session.reregistrationData.personalInfo[field.key] = userInput;
        session.reregistrationData.currentInfoField++;

        // Check if we've collected all personal information
        if (session.reregistrationData.currentInfoField >= this.PERSONAL_INFO_FIELDS.length) {
            // Move to confirmation using template
            session.state = this.REREGISTRATION_STATES.REREGISTRATION_CONFIRMATION;
            
            this.debug('All information collected, showing confirmation template', {
                companyInfo: session.reregistrationData.companyInfo,
                personalInfo: session.reregistrationData.personalInfo
            });
            
            // Try template first, with fallback to text if template fails
            try {
                return this.generateReRegistrationConfirmationTemplate(session);
            } catch (error) {
                this.debug('Template failed, using text confirmation', error);
                return this.generateReRegistrationConfirmationText(session);
            }
        }

        // Ask for next personal field
        const nextField = this.PERSONAL_INFO_FIELDS[session.reregistrationData.currentInfoField];
        return {
            type: 'message',
            content: `Thank you!\n\n${nextField.prompt}`
        };
    }

    // Handle re-registration confirmation
    async handleReRegistrationConfirmation(message, session, phoneNumber) {
        const userInput = message.toLowerCase().trim();

        // Handle template button responses or equivalent text
        if (userInput === 'confirm' || userInput === '1') {
            // Create application via API call
            try {
                const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                
                if (applicationResult.success) {
                    session.state = this.REREGISTRATION_STATES.REREGISTRATION_END;
                    session.reregistrationData.step = 'completed';
                    session.reregistrationData.applicationId = applicationResult.applicationId;

                    // Use success template
                    return {
                        type: 'template',
                        templateSid: this.SUCCESS_TEMPLATE,
                        variables: {}
                    };
                } else {
                    this.debug('API call failed', applicationResult);
                    return {
                        type: 'message',
                        content: `Error creating application: ${applicationResult.message}\n\n1. Retry - Try again\n2. Back - Modify information\n\nPlease select an option (1 or 2):`
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
            // Reset to company information collection
            session.state = this.REREGISTRATION_STATES.COLLECT_COMPANY_INFO;
            session.reregistrationData.currentInfoField = 0;
            session.reregistrationData.collectionPhase = 'company';
            session.reregistrationData.companyInfo = {};
            session.reregistrationData.personalInfo = {};

            const firstField = this.COMPANY_INFO_FIELDS[0];
            return {
                type: 'message',
                content: `Let's collect your information again.\n\n${firstField.prompt}`
            };
        }

        if (userInput === 'cancel' || userInput === '3') {
            return {
                type: 'message',
                content: `Company re-registration application cancelled.\n\n1. Start - Begin again\n2. Menu - Main services\n\nPlease select an option (1 or 2):`
            };
        }

        if (userInput === 'retry' || userInput === '1') {
            // Try to create application again
            try {
                const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                
                if (applicationResult.success) {
                    session.state = this.REREGISTRATION_STATES.REREGISTRATION_END;
                    session.reregistrationData.step = 'completed';
                    session.reregistrationData.applicationId = applicationResult.applicationId;

                    return {
                        type: 'template',
                        templateSid: this.SUCCESS_TEMPLATE,
                        variables: {}
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

        // If user sends something unexpected, show the confirmation template again
        this.debug('Unexpected input in confirmation state, reshowing template', { userInput });
        
        // Try template again with validation
        try {
            const templateResponse = this.generateReRegistrationConfirmationTemplate(session);
            const validation = this.validateTemplateVariables(templateResponse.variables);
            
            if (!validation.isValid) {
                this.debug('Template validation failed, using text fallback', validation);
                return this.generateReRegistrationConfirmationText(session);
            }
            
            return templateResponse;
        } catch (error) {
            this.debug('Template generation failed, using text fallback', error);
            return this.generateReRegistrationConfirmationText(session);
        }
    }

    // Create application via API call
    async createApplicationViaAPI(session, phoneNumber) {
        try {
            const companyInfo = session.reregistrationData.companyInfo || {};
            const personalInfo = session.reregistrationData.personalInfo || {};
            
            // Prepare application data for API
            const applicationData = {
                applicantName: personalInfo.contactName || 'Not provided',
                applicantEmail: personalInfo.contactEmail || 'Not provided',
                applicantPhone: phoneNumber,
                serviceType: 'Company Re-Registration',
                status: 'Pending',
                companyName: companyInfo.companyName || 'Not provided',
                businessType: companyInfo.businessType || 'Not provided',
                companyAddress: companyInfo.currentAddress || 'Not provided',
                positionInCompany: personalInfo.position || 'Not provided',
                registrationNumber: companyInfo.registrationNumber || 'Not provided',
            };
            
            this.debug('Calling API to create application', {
                url: `${this.API_BASE_URL}/applications`,
                data: applicationData
            });
            
            // Make API call
            const response = await axios.post(`${this.API_BASE_URL}/applications`, applicationData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            if (response.data.success) {
                this.debug('Application created successfully via API', {
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

    // Handle the end state
    async handleReRegistrationEnd(message, session, phoneNumber) {
        const userInput = message.toLowerCase().trim();

        // Handle "start" button from success template
        if (userInput === 'start' || userInput === '1') {
            // Reset session and return to main menu or start process
            delete session.reregistrationData;
            session.state = 'main_menu';
            
            return {
                type: 'message',
                content: `Starting new process...\n\nType 'menu' to see all available services.`
            };
        }

        // For any other input, show options
        return {
            type: 'message',
            content: `Your company re-registration application has been submitted successfully!\n\n1. Start - Begin a new application\n2. Menu - Main services\n\nPlease select an option (1 or 2):`
        };
    }

    // Handle default/fallback for re-registration
    async handleDefault(message, session, phoneNumber) {
        const userInput = message.toLowerCase().trim();

        if (userInput === 'back' || userInput === 'menu') {
            return {
                type: 'message',
                content: `Returning to main menu...\n\nType 'menu' or 'start' to see main services.`
            };
        }

        return {
            type: 'message',
            content: `I didn't understand that. Please follow the prompts.`
        };
    }

    // Generate re-registration confirmation template
    generateReRegistrationConfirmationTemplate(session) {
        const companyInfo = session.reregistrationData.companyInfo || {};
        const personalInfo = session.reregistrationData.personalInfo || {};
        
        // Use flat variable names that match Twilio template format
        const templateVariables = {
            company_name: (companyInfo.companyName || 'Not provided').toString(),
            registration_number: (companyInfo.registrationNumber || 'Not provided').toString(),
            business_type: (companyInfo.businessType || 'Not provided').toString(),
            current_address: (companyInfo.currentAddress || 'Not provided').toString(),
            contact_name: (personalInfo.contactName || 'Not provided').toString(),
            contact_email: (personalInfo.contactEmail || 'Not provided').toString(),
            contact_phone: (personalInfo.contactPhone || 'Not provided').toString(),
            position: (personalInfo.position || 'Not provided').toString(),
            outstanding_years: (session.reregistrationData.outstandingYears || '0').toString(),
            quote_amount: (session.reregistrationData.quoteAmount || '0').toString()
        };

        // Enhanced debugging
        this.debug('Template Variables Being Sent:', templateVariables);
        
        // Validate that we have the minimum required data
        const hasCompanyName = templateVariables.company_name !== 'Not provided';
        const hasContactName = templateVariables.contact_name !== 'Not provided';
        
        if (!hasCompanyName || !hasContactName) {
            this.debug('WARNING: Missing essential data for template', {
                hasCompanyName,
                hasContactName,
                companyInfo,
                personalInfo
            });
            
            // Fallback to text-based confirmation if essential data is missing
            throw new Error('Missing essential data for template');
        }

        // Validate template variables
        const validation = this.validateTemplateVariables(templateVariables);
        if (!validation.isValid) {
            this.debug('Template validation failed', validation);
            throw new Error('Template validation failed');
        }

        this.debug('Sending confirmation template with variables', {
            templateSid: this.CONFIRMATION_TEMPLATE,
            variableCount: Object.keys(templateVariables).length,
            variables: templateVariables
        });

        return {
            type: 'template',
            templateSid: this.CONFIRMATION_TEMPLATE,
            variables: templateVariables
        };
    }

    // Method to validate template variables match expected format
    validateTemplateVariables(templateVariables) {
        // Define the expected variables for your Twilio template
        const expectedVariables = [
            'company_name',
            'registration_number', 
            'business_type',
            'current_address',
            'contact_name',
            'contact_email',
            'contact_phone',
            'position',
            'outstanding_years',
            'quote_amount'
        ];
        
        const providedVariables = Object.keys(templateVariables);
        const missingVariables = expectedVariables.filter(v => !providedVariables.includes(v));
        const extraVariables = providedVariables.filter(v => !expectedVariables.includes(v));
        
        if (missingVariables.length > 0) {
            this.debug('WARNING: Missing template variables', missingVariables);
        }
        
        if (extraVariables.length > 0) {
            this.debug('WARNING: Extra template variables (not in template)', extraVariables);
        }

        // Check for empty values
        const emptyVariables = expectedVariables.filter(v => 
            !templateVariables[v] || templateVariables[v].trim() === ''
        );
        
        if (emptyVariables.length > 0) {
            this.debug('WARNING: Empty template variables', emptyVariables);
        }
        
        return {
            isValid: missingVariables.length === 0,
            missingVariables,
            extraVariables,
            emptyVariables
        };
    }

    // Keep the old text-based confirmation for debugging/backup
    generateReRegistrationConfirmationText(session) {
        const companyInfo = session.reregistrationData.companyInfo || {};
        const personalInfo = session.reregistrationData.personalInfo || {};
        
        let message = `Please Confirm Your Company Re-Registration Details\n\n`;
        
        message += `Company Information:\n`;
        message += `Company Name: ${companyInfo.companyName || 'Not provided'}\n`;
        message += `Registration Number: ${companyInfo.registrationNumber || 'Not provided'}\n`;
        message += `Business Type: ${companyInfo.businessType || 'Not provided'}\n`;
        message += `Address: ${companyInfo.currentAddress || 'Not provided'}\n\n`;
        
        message += `Contact Information:\n`;
        message += `Name: ${personalInfo.contactName || 'Not provided'}\n`;
        message += `Email: ${personalInfo.contactEmail || 'Not provided'}\n`;
        message += `Phone: ${personalInfo.contactPhone || 'Not provided'}\n`;
        message += `Position: ${personalInfo.position || 'Not provided'}\n`;

        if (session.reregistrationData.quoteAmount > 0) {
            message += `Outstanding Returns:\n`;
            message += `Years Outstanding: ${session.reregistrationData.outstandingYears}\n`;
            message += `Quote Amount: ${session.reregistrationData.quoteAmount}\n`;
        }

        message += `\n1. Confirm - Submit application\n`;
        message += `2. Edit - Modify information\n`;
        message += `3. Cancel - Cancel application\n\n`;
        message += `Please select an option (1, 2, or 3):`;

        return {
            type: 'message',
            content: message
        };
    }

    // Get re-registration summary for admin/debugging
    getReRegistrationSummary(session) {
        if (!session.reregistrationData) return null;

        return {
            step: session.reregistrationData.step,
            startTime: session.reregistrationData.startTime,
            companyName: session.reregistrationData.companyInfo?.companyName || 'Not provided',
            registrationNumber: session.reregistrationData.companyInfo?.registrationNumber || 'Not provided',
            contactName: session.reregistrationData.personalInfo?.contactName || 'Not provided',
            outstandingYears: session.reregistrationData.outstandingYears,
            quoteAmount: session.reregistrationData.quoteAmount,
            currentState: session.state,
            applicationId: session.reregistrationData.applicationId || 'Not created'
        };
    }

    // Calculate progress percentage
    calculateProgress(session) {
        if (!session.reregistrationData) return 0;

        const stateProgress = {
            [this.REREGISTRATION_STATES.REREGISTRATION_QUICK_REPLY]: 10,
            [this.REREGISTRATION_STATES.YEARS_COLLECTION]: 25,
            [this.REREGISTRATION_STATES.QUOTE_CONFIRMATION]: 35,
            [this.REREGISTRATION_STATES.COLLECT_COMPANY_INFO]: 60,
            [this.REREGISTRATION_STATES.COLLECT_PERSONAL_INFO]: 80,
            [this.REREGISTRATION_STATES.REREGISTRATION_CONFIRMATION]: 95,
            [this.REREGISTRATION_STATES.REREGISTRATION_END]: 100
        };

        return stateProgress[session.state] || 0;
    }
}

module.exports = CompanyReRegistrationFlow;