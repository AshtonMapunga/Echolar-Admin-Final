// company_registration.js - Company Registration Flow Handler (Updated with API Integration)
// This file manages the new company registration process flow

const axios = require('axios');

class CompanyRegistrationFlow {
    constructor() {
        // Company registration specific states
        this.REGISTRATION_STATES = {
            REGISTRATION_START: 'registration_start',
            COMPANY_NAMES_COLLECTION: 'company_names_collection',
            DIRECTORS_COUNT: 'directors_count',
            DIRECTORS_COLLECTION: 'directors_collection',
            EMAIL_COLLECTION: 'email_collection',
            DOCUMENTS_READY_CHECK: 'documents_ready_check',
            REGISTRATION_CONFIRMATION: 'registration_confirmation',
            REGISTRATION_END: 'registration_end'
        };

        // API base URL - configure this based on your environment
        this.API_BASE_URL = 'https://echolar-admin-final.onrender.com/api/v1';

        // Information collection structure
        this.COMPANY_NAME_FIELDS = [
            { key: 'name1', label: 'First Company Name Option', prompt: 'Please provide your first company name choice:' },
            { key: 'name2', label: 'Second Company Name Option', prompt: 'Please provide your second company name choice:' },
            { key: 'name3', label: 'Third Company Name Option', prompt: 'Please provide your third company name choice:' }
        ];

        this.DIRECTOR_FIELDS = [
            { key: 'fullName', label: 'Full Name', prompt: 'Please provide the director\'s full name:' },
            { key: 'idNumber', label: 'ID Number', prompt: 'Please provide the director\'s ID number:' },
            { key: 'nationality', label: 'Nationality', prompt: 'Please provide the director\'s nationality:' },
            { key: 'occupation', label: 'Occupation', prompt: 'Please provide the director\'s occupation:' },
            { key: 'phoneNumber', label: 'Phone Number', prompt: 'Please provide the director\'s phone number:' }
        ];

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] COMPANY_REGISTRATION_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Check if current state is a company registration state
    isRegistrationState(state) {
        return Object.values(this.REGISTRATION_STATES).includes(state);
    }

    // Start the company registration process
    async startCompanyRegistration(session, phoneNumber) {
        this.debug('Starting company registration flow', { phoneNumber });

        // Initialize registration data
        session.registrationData = {
            startTime: new Date().toISOString(),
            step: 'company_names',
            companyNames: {},
            directorsCount: 0,
            directors: [],
            currentDirector: 0,
            currentField: 0,
            contactEmail: '',
            currentPhase: 'names' // 'names', 'directors_count', 'directors', 'email', 'documents'
        };

        session.state = this.REGISTRATION_STATES.COMPANY_NAMES_COLLECTION;

        return {
            type: 'message',
            content: `New Company Registration\n\nWelcome! I'll help you register your new company.\n\nFirst, I need 3 possible names for your company. This gives us alternatives in case your first choice isn't available.\n\nFirst Company Name Option\nPlease provide your first company name choice:`
        };
    }

    // Process company registration input
    async processRegistrationInput(message, session, phoneNumber) {
        this.debug('Processing company registration input', {
            phoneNumber,
            state: session.state,
            message,
            registrationData: session.registrationData
        });

        switch (session.state) {
            case this.REGISTRATION_STATES.COMPANY_NAMES_COLLECTION:
                return await this.handleCompanyNamesCollection(message, session, phoneNumber);

            case this.REGISTRATION_STATES.DIRECTORS_COUNT:
                return await this.handleDirectorsCount(message, session, phoneNumber);

            case this.REGISTRATION_STATES.DIRECTORS_COLLECTION:
                return await this.handleDirectorsCollection(message, session, phoneNumber);

            case this.REGISTRATION_STATES.EMAIL_COLLECTION:
                return await this.handleEmailCollection(message, session, phoneNumber);

            case this.REGISTRATION_STATES.DOCUMENTS_READY_CHECK:
                return await this.handleDocumentsReadyCheck(message, session, phoneNumber);

            case this.REGISTRATION_STATES.REGISTRATION_CONFIRMATION:
                return await this.handleRegistrationConfirmation(message, session, phoneNumber);

            case this.REGISTRATION_STATES.REGISTRATION_END:
                return await this.handleRegistrationEnd(message, session, phoneNumber);

            default:
                return await this.handleDefault(message, session, phoneNumber);
        }
    }

    // Handle company names collection
    async handleCompanyNamesCollection(message, session, phoneNumber) {
        const userInput = message.trim();
        const currentFieldIndex = session.registrationData.currentField || 0;
        const field = this.COMPANY_NAME_FIELDS[currentFieldIndex];

        if (userInput.length === 0) {
            return {
                type: 'message',
                content: `Please provide a company name.\n\n${field.label}\n${field.prompt}`
            };
        }

        // Basic validation for company names
        if (userInput.length < 3) {
            return {
                type: 'message',
                content: `Company name seems too short. Please provide a valid company name.\n\n${field.label}\n${field.prompt}`
            };
        }

        // Store the company name
        session.registrationData.companyNames[field.key] = userInput;
        session.registrationData.currentField++;

        // Check if we've collected all 3 company names
        if (session.registrationData.currentField >= this.COMPANY_NAME_FIELDS.length) {
            session.state = this.REGISTRATION_STATES.DIRECTORS_COUNT;
            session.registrationData.step = 'directors_count';
            session.registrationData.currentPhase = 'directors_count';

            return {
                type: 'message',
                content: `Great! I have your 3 company name options:\n\n1. ${session.registrationData.companyNames.name1}\n2. ${session.registrationData.companyNames.name2}\n3. ${session.registrationData.companyNames.name3}\n\nNow, how many directors will this company have?\n\nNote: A company must have at least 1 director, and can have multiple directors\n\nPlease enter the number of directors (e.g., 1, 2, 3, etc.):`
            };
        }

        // Ask for next company name
        const nextField = this.COMPANY_NAME_FIELDS[session.registrationData.currentField];
        return {
            type: 'message',
            content: `Got it: "${userInput}"\n\n${nextField.label}\n${nextField.prompt}`
        };
    }

    // Handle directors count
    async handleDirectorsCount(message, session, phoneNumber) {
        const userInput = message.trim();
        const directorsCount = parseInt(userInput);

        if (isNaN(directorsCount) || directorsCount < 1) {
            return {
                type: 'message',
                content: `Please enter a valid number of directors. A company must have at least 1 director.\n\nHow many directors will this company have? (Enter a number like 1, 2, 3, etc.)`
            };
        }

        if (directorsCount > 10) {
            return {
                type: 'message',
                content: `That's quite a lot of directors (${directorsCount}). Please confirm this number is correct, or contact our support team if you need assistance with a large number of directors.\n\nPlease enter the correct number of directors:`
            };
        }

        session.registrationData.directorsCount = directorsCount;
        session.registrationData.directors = [];
        session.registrationData.currentDirector = 0;
        session.registrationData.currentField = 0;
        session.state = this.REGISTRATION_STATES.DIRECTORS_COLLECTION;
        session.registrationData.step = 'directors_collection';
        session.registrationData.currentPhase = 'directors';

        const firstField = this.DIRECTOR_FIELDS[0];
        return {
            type: 'message',
            content: `Perfect! I'll collect information for ${directorsCount} director${directorsCount > 1 ? 's' : ''}.\n\nDirector 1 of ${directorsCount}\n\n${firstField.label}\n${firstField.prompt}`
        };
    }

    // Handle directors collection
    async handleDirectorsCollection(message, session, phoneNumber) {
        const userInput = message.trim();
        const currentFieldIndex = session.registrationData.currentField;
        const currentDirectorIndex = session.registrationData.currentDirector;
        const field = this.DIRECTOR_FIELDS[currentFieldIndex];

        if (userInput.length === 0) {
            return {
                type: 'message',
                content: `Please provide the required information.\n\nDirector ${currentDirectorIndex + 1} of ${session.registrationData.directorsCount}\n\n${field.label}\n${field.prompt}`
            };
        }

        // Basic validation for specific fields
        if (field.key === 'idNumber' && userInput.length < 5) {
            return {
                type: 'message',
                content: `ID number seems too short. Please provide a valid ID number.\n\n${field.label}\n${field.prompt}`
            };
        }

        if (field.key === 'phoneNumber' && !/^\+?[\d\s\-\(\)]{7,}$/.test(userInput)) {
            return {
                type: 'message',
                content: `Please provide a valid phone number format.\n\n${field.label}\n${field.prompt}`
            };
        }

        // Initialize director object if it doesn't exist
        if (!session.registrationData.directors[currentDirectorIndex]) {
            session.registrationData.directors[currentDirectorIndex] = {};
        }

        // Store the field value
        session.registrationData.directors[currentDirectorIndex][field.key] = userInput;
        session.registrationData.currentField++;

        // Check if we've collected all fields for current director
        if (session.registrationData.currentField >= this.DIRECTOR_FIELDS.length) {
            session.registrationData.currentDirector++;
            session.registrationData.currentField = 0;

            // Check if we've collected all directors
            if (session.registrationData.currentDirector >= session.registrationData.directorsCount) {
                session.state = this.REGISTRATION_STATES.EMAIL_COLLECTION;
                session.registrationData.step = 'email_collection';
                session.registrationData.currentPhase = 'email';

                return {
                    type: 'message',
                    content: `Great! I've collected information for all ${session.registrationData.directorsCount} director${session.registrationData.directorsCount > 1 ? 's' : ''}.\n\nContact Email Address\n\nPlease provide the email address where we should send updates about your company registration:`
                };
            }

            // Move to next director
            const nextDirectorNumber = session.registrationData.currentDirector + 1;
            const firstField = this.DIRECTOR_FIELDS[0];
            return {
                type: 'message',
                content: `Director ${currentDirectorIndex + 1} information collected!\n\nDirector ${nextDirectorNumber} of ${session.registrationData.directorsCount}\n\n${firstField.label}\n${firstField.prompt}`
            };
        }

        // Ask for next field for current director
        const nextField = this.DIRECTOR_FIELDS[session.registrationData.currentField];
        return {
            type: 'message',
            content: `Got it!\n\nDirector ${currentDirectorIndex + 1} of ${session.registrationData.directorsCount}\n\n${nextField.label}\n${nextField.prompt}`
        };
    }

    // Handle email collection
    async handleEmailCollection(message, session, phoneNumber) {
        const userInput = message.trim();

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userInput)) {
            return {
                type: 'message',
                content: `Please provide a valid email address format (e.g., example@company.com)\n\nEmail address:`
            };
        }

        session.registrationData.contactEmail = userInput;
        session.state = this.REGISTRATION_STATES.DOCUMENTS_READY_CHECK;
        session.registrationData.step = 'documents_ready_check';
        session.registrationData.currentPhase = 'documents';

        // Create documents instruction message
        const directorsPlural = session.registrationData.directorsCount > 1 ? 's' : '';
        let directorsNames = session.registrationData.directors
            .map((director, index) => `${index + 1}. ${director.fullName}`)
            .join('\n');

        return {
            type: 'message',
            content: `Email address recorded: ${userInput}\n\nRequired Documents\n\nTo complete your company registration, please have the following documents ready:\n\nFor each director${directorsPlural}:\n${directorsNames}\n\nRequired for each director:\n- Copy of National ID (both sides)\n- Proof of residential address (utility bill, bank statement, or lease agreement - not older than 3 months)\n\nAre your documents ready?\n\nType 1 for: Documents ready\nType 2 for: Documents not ready`
        };
    }

    // Handle documents ready check
    async handleDocumentsReadyCheck(message, session, phoneNumber) {
        const userInput = message.trim();

        if (userInput === '1') {
            session.state = this.REGISTRATION_STATES.REGISTRATION_CONFIRMATION;
            session.registrationData.step = 'confirmation';
            
            return this.generateRegistrationConfirmationText(session);
        } else if (userInput === '2') {
            session.state = 'main_menu';
            delete session.registrationData;
            
            return {
                type: 'message',
                content: `Application cancelled. Returning to main menu.\n\nType 'menu' to see available services.`
            };
        } else {
            return {
                type: 'message',
                content: `Invalid option. Please select:\n\nType 1 for: Documents ready\nType 2 for: Documents not ready`
            };
        }
    }

    // Handle registration confirmation - UPDATED WITH API INTEGRATION
    async handleRegistrationConfirmation(message, session, phoneNumber) {
        const userInput = message.trim();

        if (userInput === '1') {
            // Create application via API call
            try {
                const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                
                if (applicationResult.success) {
                    session.state = this.REGISTRATION_STATES.REGISTRATION_END;
                    session.registrationData.step = 'completed';
                    session.registrationData.applicationId = applicationResult.applicationId;

                    return {
                        type: 'message',
                        content: `Company Registration Application Submitted Successfully!\n\nApplication Summary:\n- Primary Company Name: ${session.registrationData.companyNames.name1}\n- Number of Directors: ${session.registrationData.directorsCount}\n- Contact Email: ${session.registrationData.contactEmail}\n- Reference Number: ${applicationResult.referenceNumber}\n\nNext Steps:\n1. Our team will review your application and documents\n2. We'll check name availability with the registrar\n3. We'll process your registration\n4. You'll receive updates via email and WhatsApp\n\nTimeline:\n- Initial review: 1-2 business days\n- Registration processing: 5-10 business days\n- Certificate issuance: 2-3 business days after approval\n\nType 'start' for a new application or 'menu' for main services.`
                    };
                } else {
                    this.debug('API call failed', applicationResult);
                    return {
                        type: 'message',
                        content: `Error creating application: ${applicationResult.message}\n\nType 'retry' to try again or 'back' to modify information.`
                    };
                }
            } catch (error) {
                this.debug('Error creating application via API', error);
                return {
                    type: 'message',
                    content: `Error creating application. Please try again or contact support.\n\nType 'retry' to try again.`
                };
            }
        } else if (userInput === '2') {
            // Reset to beginning
            session.state = this.REGISTRATION_STATES.COMPANY_NAMES_COLLECTION;
            session.registrationData = {
                startTime: new Date().toISOString(),
                step: 'company_names',
                companyNames: {},
                directorsCount: 0,
                directors: [],
                currentDirector: 0,
                currentField: 0,
                contactEmail: '',
                currentPhase: 'names'
            };

            const firstField = this.COMPANY_NAME_FIELDS[0];
            return {
                type: 'message',
                content: `Let's edit your information.\n\n${firstField.label}\n${firstField.prompt}`
            };
        } else if (userInput === '3') {
            session.state = 'main_menu';
            delete session.registrationData;
            
            return {
                type: 'message',
                content: `Company registration application cancelled.\n\nType 'menu' for main services.`
            };
        } else {
            // If unexpected input, show confirmation again
            return this.generateRegistrationConfirmationText(session);
        }
    }

    // Create application via API call
    async createApplicationViaAPI(session, phoneNumber) {
        try {
            const companyNames = session.registrationData.companyNames || {};
            const directors = session.registrationData.directors || [];
            
            // Prepare application data for API - mapping to your MongoDB model
            const applicationData = {
                applicantName: directors[0]?.fullName || 'Not provided', // Use first director as applicant
                applicantEmail: session.registrationData.contactEmail || 'Not provided',
                applicantPhone: phoneNumber,
                serviceType: 'Company Registration',
                status: 'Pending',
                companyName: companyNames.name1 || 'Not provided',
                companyName2: companyNames.name2 || 'Not provided',
                companyName3: companyNames.name3 || 'Not provided',
                directors: directors, // Array of director objects
                directorsCount: session.registrationData.directorsCount || 0,
                contactEmail: session.registrationData.contactEmail || 'Not provided',
                whatsappNumber: phoneNumber,
                documentsSubmitted: true, // Assuming documents are ready when confirming
                flowSessionData: session.registrationData // Store complete session data for reference
            };
            
            this.debug('Calling API to create company registration application', {
                url: `${this.API_BASE_URL}/applications`,
                data: applicationData
            });
            
            // Make API call
            const response = await axios.post(`${this.API_BASE_URL}/applications`, applicationData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });
            
            if (response.data.success) {
                this.debug('Company registration application created successfully via API', {
                    applicationId: response.data.data._id,
                    referenceNumber: response.data.data.referenceNumber
                });
                
                return {
                    success: true,
                    applicationId: response.data.data._id,
                    referenceNumber: response.data.data.referenceNumber,
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

    // Handle registration end state
    async handleRegistrationEnd(message, session, phoneNumber) {
        const userInput = message.toLowerCase().trim();

        if (userInput === 'start') {
            delete session.registrationData;
            session.state = 'main_menu';
            
            return {
                type: 'message',
                content: `Starting new process...\n\nType 'menu' to see all available services or 'help' for assistance.`
            };
        }

        return {
            type: 'message',
            content: `Your company registration application has been submitted successfully!\n\nType 'start' to begin a new application or 'menu' for main services.`
        };
    }

    // Handle default/fallback
    async handleDefault(message, session, phoneNumber) {
        const userInput = message.toLowerCase().trim();

        if (userInput === 'back' || userInput === 'menu') {
            return {
                type: 'message',
                content: `Returning to main menu...\n\nType 'menu' or 'start' to see main services.`
            };
        }

        if (userInput === 'help') {
            return {
                type: 'message',
                content: `Company Registration Help\n\nYou are currently in: ${session.state}\n\nAvailable commands:\n- 'back' or 'menu' - Return to main menu\n- 'help' - Show this help\n- 'reset' - Start over\n\nPlease follow the prompts or use the commands above.`
            };
        }

        return {
            type: 'message',
            content: `I didn't understand that. Please follow the prompts or type 'help' for assistance.`
        };
    }

    // Generate text-based confirmation (primary method now)
    generateRegistrationConfirmationText(session) {
        const companyNames = session.registrationData.companyNames || {};
        const directors = session.registrationData.directors || [];
        
        let message = `Please Confirm Your Company Registration Details\n\n`;
        
        message += `Company Name Options:\n`;
        message += `1. ${companyNames.name1 || 'Not provided'}\n`;
        message += `2. ${companyNames.name2 || 'Not provided'}\n`;
        message += `3. ${companyNames.name3 || 'Not provided'}\n\n`;
        
        message += `Directors (${session.registrationData.directorsCount}):\n`;
        directors.forEach((director, index) => {
            message += `${index + 1}. ${director.fullName || 'Not provided'} (${director.nationality || 'Not specified'})\n`;
        });
        
        message += `\nContact Email: ${session.registrationData.contactEmail || 'Not provided'}\n`;
        message += `\nDocuments: Required documents submitted\n`;
        
        message += `\nType 1 to: Confirm and submit application\n`;
        message += `Type 2 to: Edit information\n`;
        message += `Type 3 to: Cancel application`;

        return {
            type: 'message',
            content: message
        };
    }

    // Get registration summary
    getRegistrationSummary(session) {
        if (!session.registrationData) return null;

        return {
            step: session.registrationData.step,
            startTime: session.registrationData.startTime,
            companyNames: session.registrationData.companyNames,
            directorsCount: session.registrationData.directorsCount,
            contactEmail: session.registrationData.contactEmail,
            currentState: session.state,
            directorsCollected: session.registrationData.directors.length,
            applicationId: session.registrationData.applicationId || 'Not created'
        };
    }

    // Calculate progress percentage
    calculateProgress(session) {
        if (!session.registrationData) return 0;

        const stateProgress = {
            [this.REGISTRATION_STATES.COMPANY_NAMES_COLLECTION]: 20,
            [this.REGISTRATION_STATES.DIRECTORS_COUNT]: 30,
            [this.REGISTRATION_STATES.DIRECTORS_COLLECTION]: 60,
            [this.REGISTRATION_STATES.EMAIL_COLLECTION]: 80,
            [this.REGISTRATION_STATES.DOCUMENTS_READY_CHECK]: 90,
            [this.REGISTRATION_STATES.REGISTRATION_CONFIRMATION]: 95,
            [this.REGISTRATION_STATES.REGISTRATION_END]: 100
        };

        return stateProgress[session.state] || 0;
    }
}

module.exports = CompanyRegistrationFlow;