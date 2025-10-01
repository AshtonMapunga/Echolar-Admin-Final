// licensing_flow.js - WhatsApp Chatbot Licensing Flow Handler
// This file manages the licensing application process for different license types

const axios = require('axios');

class LicensingFlow {
    constructor() {
        // Licensing flow states
        this.LICENSING_STATES = {
            LICENSING_START: 'licensing_start',
            LIQUOR_LICENSE: 'liquor_license',
            IMPORT_LICENSE: 'import_license', 
            TRADING_LICENSE: 'trading_license',
            MONEY_LENDING_LICENSE: 'money_lending_license',
            LICENSING_COLLECT_INFO: 'licensing_collect_info',
            LICENSING_CONFIRMATION: 'licensing_confirmation',
            LICENSING_END: 'licensing_end'
        };

        // License type configurations
        this.LICENSE_TYPES = {
            'Liquor license': {
                templateId: 'HX025966aebeb7702f2c3aa63b6c52b3aa',
                state: this.LICENSING_STATES.LIQUOR_LICENSE,
                fields: ['companyName', 'email', 'address', 'contactPerson', 'phoneNumber', 'businessType', 'premisesSize', 'targetMarket'],
                fieldLabels: {
                    companyName: '🏢 Company/Business Name',
                    email: '📧 Email Address',
                    address: '📍 Business Address',
                    contactPerson: '👤 Contact Person Name',
                    phoneNumber: '📱 Phone Number',
                    businessType: '🏪 Type of Business (Restaurant/Bar/Retail/etc.)',
                    premisesSize: '📏 Premises Size (in square meters)',
                    targetMarket: '🎯 Target Market Description'
                }
            },
            'Import license': {
                templateId: 'HXc950df4f8205f26ad575e4bb17878fb1',
                state: this.LICENSING_STATES.IMPORT_LICENSE,
                fields: ['companyName', 'email', 'address', 'contactPerson', 'phoneNumber', 'businessType', 'premisesSize', 'targetMarket'],
                fieldLabels: {
                    companyName: '🏢 Company/Business Name',
                    email: '📧 Email Address',
                    address: '📍 Business Address',
                    contactPerson: '👤 Contact Person Name',
                    phoneNumber: '📱 Phone Number',
                    businessType: '🏪 Type of Import Business',
                    premisesSize: '📏 Premises Size (in square meters)',
                    targetMarket: '🎯 Target Market Description'
                }
            },
            'Trading license': {
                templateId: 'HX4904b0c265a7d6b26786143b2a1d7d7e',
                state: this.LICENSING_STATES.TRADING_LICENSE,
                fields: ['companyName', 'email', 'address', 'contactPerson', 'phoneNumber', 'businessType', 'premisesSize', 'targetMarket'],
                fieldLabels: {
                    companyName: '🏢 Company/Business Name',
                    email: '📧 Email Address',
                    address: '📍 Business Address',
                    contactPerson: '👤 Contact Person Name',
                    phoneNumber: '📱 Phone Number',
                    businessType: '🏪 Type of Trading (Retail/Wholesale/Online/etc.)',
                    premisesSize: '📏 Premises Size (in square meters)',
                    targetMarket: '🎯 Target Market Description'
                }
            },
            'Money lending license': {
                templateId: 'HXd295a6ab98c74ab6d2eff531ebcddbce',
                state: this.LICENSING_STATES.MONEY_LENDING_LICENSE,
                fields: ['companyName', 'email', 'address', 'contactPerson', 'phoneNumber', 'businessType', 'premisesSize', 'targetMarket'],
                fieldLabels: {
                    companyName: '🏢 Company/Business Name',
                    email: '📧 Email Address',
                    address: '📍 Business Address',
                    contactPerson: '👤 Contact Person Name',
                    phoneNumber: '📱 Phone Number',
                    businessType: '🏪 Money Lending Business Model',
                    premisesSize: '📏 Available Capital Amount',
                    targetMarket: '🎯 Target Client Base'
                }
            }
        };

        // API endpoint for submitting license applications
        this.API_ENDPOINT = process.env.LICENSE_API_ENDPOINT || 'https://chatbotbackend-1ox6.onrender.com/api/v1/licence-applications';

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] LICENSING_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] LICENSING_DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Check if current state is a licensing flow state
    isLicensingState(state) {
        return Object.values(this.LICENSING_STATES).includes(state);
    }

    // Start licensing application based on selected license type
    async startLicensingApplication(session, phoneNumber, licenseType) {
        this.debug('Starting licensing application', { phoneNumber, licenseType });

        const licenseConfig = this.LICENSE_TYPES[licenseType];
        if (!licenseConfig) {
            return {
                type: 'message',
                content: `❌ Invalid license type: ${licenseType}. Please select a valid license type.`
            };
        }

        // Initialize licensing data
        session.licensingData = {
            licenseType: licenseType,
            startTime: new Date().toISOString(),
            collectedInfo: {},
            currentField: 0,
            fields: licenseConfig.fields,
            fieldLabels: licenseConfig.fieldLabels,
            applicationId: this.generateApplicationId()
        };

        session.state = licenseConfig.state;

        this.debug('Licensing application started', {
            phoneNumber,
            licenseType,
            applicationId: session.licensingData.applicationId,
            state: session.state
        });

        // Send the specific license template
        return {
            type: 'template',
            templateSid: licenseConfig.templateId,
            variables: {}
        };
    }

    // Process licensing input based on current state
    async processLicensingInput(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();
        
        this.debug('Processing licensing input', {
            phoneNumber,
            currentState: session.state,
            userInput,
            originalMessage: message
        });

        switch (session.state) {
            case this.LICENSING_STATES.LIQUOR_LICENSE:
            case this.LICENSING_STATES.IMPORT_LICENSE:
            case this.LICENSING_STATES.TRADING_LICENSE:
            case this.LICENSING_STATES.MONEY_LENDING_LICENSE:
                return await this.handleLicenseTemplateResponse(message, session, phoneNumber);

            case this.LICENSING_STATES.LICENSING_COLLECT_INFO:
                return await this.handleInfoCollection(message, session, phoneNumber);

            case this.LICENSING_STATES.LICENSING_CONFIRMATION:
                return await this.handleConfirmation(message, session, phoneNumber);

            default:
                return await this.handleDefault(message, session, phoneNumber);
        }
    }

    // Handle response from license template (Apply button click)
    async handleLicenseTemplateResponse(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        // Check for Apply button click or similar confirmation
        if (userInput === 'apply' || userInput === 'start application' || userInput === 'proceed' || userInput === 'yes') {
            return await this.startInfoCollection(session, phoneNumber);
        }

        // Handle back/cancel
        if (userInput === 'back' || userInput === 'cancel') {
            // Reset to main licensing menu
            session.state = 'licensing'; // Go back to licensing service selection
            session.licensingData = null;
            return {
                type: 'message',
                content: "🔙 Returning to licensing options. Please select a license type from the menu above."
            };
        }

        // Handle help or unclear input
        if (userInput === 'help' || userInput === 'info') {
            const licenseType = session.licensingData?.licenseType;
            return {
                type: 'message',
                content: `ℹ️ *${licenseType} Information*\n\nTo proceed with your ${licenseType} application:\n• Click 'Apply' to start the application process\n• Type 'back' to choose a different license\n• Type 'help' for this information`
            };
        }

        // Default response
        return {
            type: 'message',
            content: `📋 To proceed with your *${session.licensingData?.licenseType}* application, please click the 'Apply' button above or type 'apply' to start the process.\n\nType 'back' to choose a different license type.`
        };
    }

    // Start information collection process
    async startInfoCollection(session, phoneNumber) {
        session.state = this.LICENSING_STATES.LICENSING_COLLECT_INFO;
        session.licensingData.currentField = 0;

        const firstField = session.licensingData.fields[0];
        const fieldLabel = session.licensingData.fieldLabels[firstField];
        const licenseType = session.licensingData.licenseType;

        this.debug('Starting info collection', {
            phoneNumber,
            licenseType,
            firstField,
            totalFields: session.licensingData.fields.length
        });

        return {
            type: 'message',
            content: `📝 *${licenseType} Application*\n\n` +
                    `Application ID: ${session.licensingData.applicationId}\n\n` +
                    `I need to collect some information for your application. Let's start:\n\n` +
                    `${fieldLabel}:`
        };
    }

    // Handle information collection
    async handleInfoCollection(message, session, phoneNumber) {
        const userInput = message.trim();
        const currentFieldIndex = session.licensingData.currentField;
        const fields = session.licensingData.fields;
        const fieldLabels = session.licensingData.fieldLabels;

        if (!userInput) {
            const currentField = fields[currentFieldIndex];
            const fieldLabel = fieldLabels[currentField];
            return {
                type: 'message',
                content: `Please provide your ${fieldLabel.split(' ').slice(1).join(' ').toLowerCase()}:`
            };
        }

        // Store the current field information
        const currentField = fields[currentFieldIndex];
        session.licensingData.collectedInfo[currentField] = userInput;
        session.licensingData.currentField++;

        this.debug('Field collected', {
            phoneNumber,
            field: currentField,
            value: userInput,
            progress: `${session.licensingData.currentField}/${fields.length}`
        });

        // Check if we've collected all information
        if (session.licensingData.currentField >= fields.length) {
            session.state = this.LICENSING_STATES.LICENSING_CONFIRMATION;
            return this.generateConfirmationMessage(session);
        }

        // Ask for next field
        const nextFieldIndex = session.licensingData.currentField;
        const nextField = fields[nextFieldIndex];
        const nextFieldLabel = fieldLabels[nextField];

        const progress = `(${session.licensingData.currentField}/${fields.length})`;

        return {
            type: 'message',
            content: `✅ Thank you! ${progress}\n\nNow please provide:\n\n${nextFieldLabel}:`
        };
    }

    // Handle confirmation
    async handleConfirmation(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        if (userInput === 'confirm' || userInput === 'submit' || userInput === 'yes' || userInput === '1') {
            // Submit the application to the API
            const submissionResult = await this.submitApplication(session, phoneNumber);
            
            if (submissionResult.success) {
                session.state = this.LICENSING_STATES.LICENSING_END;
                
                const licenseType = session.licensingData.licenseType;
                const applicationId = session.licensingData.applicationId;
                const companyName = session.licensingData.collectedInfo.companyName;

                this.debug('License application confirmed and submitted', {
                    phoneNumber,
                    licenseType,
                    applicationId,
                    companyName,
                    apiResponse: submissionResult.data
                });

                return {
                    type: 'message',
                    content: `🎉 *${licenseType} Application Submitted Successfully!*\n\n` +
                            `📋 Application ID: ${applicationId}\n` +
                            `🏢 Company: ${companyName}\n` +
                            `📅 Submitted: ${new Date().toLocaleDateString()}\n\n` +
                            `✅ Your application has been received and is being processed.\n\n` +
                            `📞 We will contact you within 5-7 business days with updates on your ${licenseType} application.\n\n` +
                            `📧 You will receive an email confirmation shortly.\n\n` +
                            `🔄 Type 'start' to begin a new application or 'menu' for main services.`
                };
            } else {
                // Handle API submission error
                this.debug('License application submission failed', {
                    phoneNumber,
                    error: submissionResult.error
                });

                return {
                    type: 'message',
                    content: `❌ *Application Submission Failed*\n\n` +
                            `We encountered an error while submitting your application. Please try again later or contact support.\n\n` +
                            `Error: ${submissionResult.error}\n\n` +
                            `Type 'edit' to modify your information or 'cancel' to abort.`
                };
            }
        }

        if (userInput === 'edit' || userInput === 'modify' || userInput === '2') {
            session.state = this.LICENSING_STATES.LICENSING_COLLECT_INFO;
            session.licensingData.currentField = 0;
            session.licensingData.collectedInfo = {};

            const firstField = session.licensingData.fields[0];
            const fieldLabel = session.licensingData.fieldLabels[firstField];

            return {
                type: 'message',
                content: `📝 Let's collect your information again.\n\n${fieldLabel}:`
            };
        }

        if (userInput === 'cancel' || userInput === '3') {
            const applicationId = session.licensingData.applicationId;
            session.licensingData = null;
            session.state = 'main_menu';

            return {
                type: 'message',
                content: `❌ ${session.licensingData?.licenseType || 'License'} application (${applicationId}) cancelled.\n\n🔄 Type 'start' to begin again or 'menu' for main services.`
            };
        }

        // Re-display confirmation
        return this.generateConfirmationMessage(session);
    }

    // Submit application to API
    async submitApplication(session, phoneNumber) {
        try {
            const licenseData = {
                applicationId: session.licensingData.applicationId,
                licenseType: session.licensingData.licenseType,
                phoneNumber: phoneNumber,
                ...session.licensingData.collectedInfo,
                submittedAt: new Date().toISOString()
            };

            this.debug('Submitting application to API', { licenseData });

            // Make API call to submit the license application
            const response = await axios.post(this.API_ENDPOINT, licenseData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });

            this.debug('API response received', { 
                status: response.status,
                data: response.data 
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            this.debug('API submission error', { error: error.message });
            
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Unknown error'
            };
        }
    }

    // Handle default/fallback
    async handleDefault(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        if (userInput === 'start' || userInput === 'menu') {
            session.licensingData = null;
            session.state = 'main_menu';
            return {
                type: 'message',
                content: "🔄 Returning to main menu..."
            };
        }

        if (userInput === 'help') {
            const licenseType = session.licensingData?.licenseType || 'Unknown';
            const applicationId = session.licensingData?.applicationId || 'N/A';
            
            return {
                type: 'message',
                content: `🆘 *Licensing Help*\n\n` +
                        `Current License Type: ${licenseType}\n` +
                        `Application ID: ${applicationId}\n` +
                        `Current State: ${session.state}\n\n` +
                        `Available commands:\n` +
                        `• 'menu' - Return to main menu\n` +
                        `• 'cancel' - Cancel current application\n` +
                        `• 'help' - Show this help message`
            };
        }

        return {
            type: 'message',
            content: "❓ I didn't understand that. Type 'help' for available commands or 'menu' to return to main services."
        };
    }

    // Generate confirmation message
    generateConfirmationMessage(session) {
        const info = session.licensingData.collectedInfo;
        const licenseType = session.licensingData.licenseType;
        const applicationId = session.licensingData.applicationId;
        const fieldLabels = session.licensingData.fieldLabels;
        
        let message = `📋 *Please Confirm Your ${licenseType} Application*\n\n`;
        message += `🆔 Application ID: ${applicationId}\n`;
        message += `📋 License Type: ${licenseType}\n\n`;
        
        message += `📝 *Application Details:*\n`;
        
        for (const [field, value] of Object.entries(info)) {
            const label = fieldLabels[field] || field;
            message += `🔹 ${label.split(' ').slice(1).join(' ')}: ${value}\n`;
        }
        
        message += `\n`;
        message += `✅ Type 'confirm' to submit application\n`;
        message += `✏️ Type 'edit' to modify information\n`;
        message += `❌ Type 'cancel' to cancel application`;

        return {
            type: 'message',
            content: message
        };
    }

    // Generate unique application ID
    generateApplicationId() {
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `LIC-${timestamp}-${random}`;
    }

    // Calculate application progress
    calculateProgress(session) {
        if (!session.licensingData) return 0;

        const totalStates = Object.keys(this.LICENSING_STATES).length;
        const currentStateIndex = Object.values(this.LICENSING_STATES).indexOf(session.state);
        
        if (session.state === this.LICENSING_STATES.LICENSING_COLLECT_INFO) {
            const fieldProgress = session.licensingData.currentField / session.licensingData.fields.length;
            return Math.round(((currentStateIndex + fieldProgress) / totalStates) * 100);
        }
        
        return Math.round((currentStateIndex / totalStates) * 100);
    }

    // Get licensing application summary
    getLicensingSummary(session) {
        if (!session.licensingData) return null;

        return {
            licenseType: session.licensingData.licenseType,
            applicationId: session.licensingData.applicationId,
            startTime: session.licensingData.startTime,
            currentState: session.state,
            progress: this.calculateProgress(session),
            collectedInfo: session.licensingData.collectedInfo,
            fieldsCompleted: session.licensingData.currentField || 0,
            totalFields: session.licensingData.fields?.length || 0
        };
    }

    // Get all licensing applications (for admin purposes)
    getAllLicensingApplications(userSessions) {
        const licensingApplications = [];

        for (const [phoneNumber, session] of userSessions.entries()) {
            if (session.licensingData || this.isLicensingState(session.state)) {
                licensingApplications.push({
                    phoneNumber,
                    summary: this.getLicensingSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return licensingApplications;
    }
}

module.exports = LicensingFlow;