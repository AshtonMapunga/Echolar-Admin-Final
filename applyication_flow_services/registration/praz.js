// praz.js - PRAZ Registration Flow Handler
// This module handles the complete PRAZ registration process including banking details and company email collection

const axios = require('axios');

class PrazRegistrationFlow {
    constructor() {
        // PRAZ-specific states
        this.PRAZ_STATES = {
            PRAZ_START: 'praz_start',
            PRAZ_COMPANY_EMAIL: 'praz_company_email',
            PRAZ_BANK_NAME: 'praz_bank_name',
            PRAZ_ACCOUNT_NUMBER: 'praz_account_number',
            PRAZ_ACCOUNT_HOLDER: 'praz_account_holder',
            PRAZ_BRANCH_NAME: 'praz_branch_name',
            PRAZ_BRANCH_CODE: 'praz_branch_code',
            PRAZ_ACCOUNT_TYPE: 'praz_account_type',
            PRAZ_CONFIRMATION: 'praz_confirmation',
            PRAZ_END: 'praz_end'
        };

        // Banking information fields in order
        this.BANKING_FIELDS = [
            { key: 'companyEmail', label: '📧 Company Email Address', type: 'email' },
            { key: 'bankName', label: '🏦 Bank Name', type: 'text' },
            { key: 'accountNumber', label: '🔢 Account Number', type: 'number' },
            { key: 'accountHolder', label: '👤 Account Holder Name', type: 'text' },
            { key: 'branchName', label: '🏢 Branch Name', type: 'text' },
            { key: 'branchCode', label: '🔢 Branch Code', type: 'text' },
            { key: 'accountType', label: '💳 Account Type', type: 'select' }
        ];

        // Account types for selection
        this.ACCOUNT_TYPES = [
            'Current Account',
            'Savings Account',
            'Business Account',
            'Corporate Account'
        ];

        // Popular banks in Zimbabwe (you can expand this list)
        this.ZIMBABWE_BANKS = [
            'CBZ Bank',
            'Stanbic Bank',
            'Standard Chartered Bank',
            'CABS',
            'Steward Bank',
            'FBC Bank',
            'NMB Bank',
            'ZB Bank',
            'Agribank',
            'People\'s Own Savings Bank',
            'Other'
        ];

        // API base URL
        this.API_BASE_URL = 'https://chatbotbackend-1ox6.onrender.com/api/v1';

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] PRAZ_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] PRAZ_DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Initialize PRAZ registration data in user session
    initializePrazSession(session) {
        if (!session.prazData) {
            session.prazData = {
                companyEmail: '',
                bankName: '',
                accountNumber: '',
                accountHolder: '',
                branchName: '',
                branchCode: '',
                accountType: '',
                currentFieldIndex: 0,
                startTime: new Date().toISOString(),
                applicationId: null
            };
        }
        return session.prazData;
    }

    // Start PRAZ registration process
    async startPrazRegistration(session, phoneNumber) {
        this.debug('Starting PRAZ registration', { phoneNumber });
        
        this.initializePrazSession(session);
        session.state = this.PRAZ_STATES.PRAZ_COMPANY_EMAIL;
        session.prazData.currentFieldIndex = 0;

        return {
            type: 'message',
            content: `🏛️ *PRAZ Registration Application*\n\n📋 Welcome to the Public Procurement and Disposal of Public Assets Authority (PRAZ) registration process.\n\nTo complete your PRAZ registration, I'll need to collect your banking details and company information.\n\n⏰ This process takes about 5-10 minutes.\n\n📧 Let's start with your company email address:\n\n*Please provide your company email:*`
        };
    }

    // Process PRAZ-specific user input
    async processPrazInput(message, session, phoneNumber) {
        const userInput = message.trim();
        const prazData = this.initializePrazSession(session);

        this.debug('Processing PRAZ input', {
            phoneNumber,
            currentState: session.state,
            userInput,
            currentFieldIndex: prazData.currentFieldIndex
        });

        switch (session.state) {
            case this.PRAZ_STATES.PRAZ_COMPANY_EMAIL:
                return await this.handleCompanyEmail(userInput, session, phoneNumber);

            case this.PRAZ_STATES.PRAZ_BANK_NAME:
                return await this.handleBankName(userInput, session, phoneNumber);

            case this.PRAZ_STATES.PRAZ_ACCOUNT_NUMBER:
                return await this.handleAccountNumber(userInput, session, phoneNumber);

            case this.PRAZ_STATES.PRAZ_ACCOUNT_HOLDER:
                return await this.handleAccountHolder(userInput, session, phoneNumber);

            case this.PRAZ_STATES.PRAZ_BRANCH_NAME:
                return await this.handleBranchName(userInput, session, phoneNumber);

            case this.PRAZ_STATES.PRAZ_BRANCH_CODE:
                return await this.handleBranchCode(userInput, session, phoneNumber);

            case this.PRAZ_STATES.PRAZ_ACCOUNT_TYPE:
                return await this.handleAccountType(userInput, session, phoneNumber);

            case this.PRAZ_STATES.PRAZ_CONFIRMATION:
                return await this.handlePrazConfirmation(userInput, session, phoneNumber);

            case this.PRAZ_STATES.PRAZ_END:
                return await this.handlePrazEnd(userInput, session, phoneNumber);

            default:
                return await this.handlePrazDefault(userInput, session, phoneNumber);
        }
    }

    // Handle company email input
    async handleCompanyEmail(userInput, session, phoneNumber) {
        if (this.isValidEmail(userInput)) {
            session.prazData.companyEmail = userInput;
            session.state = this.PRAZ_STATES.PRAZ_BANK_NAME;

            return {
                type: 'message',
                content: `✅ Email saved: ${userInput}\n\n🏦 *Banking Information*\n\nNow let's collect your banking details for PRAZ registration.\n\n📋 Please select your bank from the list below:\n\n${this.generateBankList()}\n\n*Please type the number or name of your bank:*`
            };
        }

        return {
            type: 'message',
            content: `❌ Invalid email format. Please provide a valid company email address:\n\n*Example: company@example.com*`
        };
    }

    // Handle bank name selection
    async handleBankName(userInput, session, phoneNumber) {
        let selectedBank = null;

        // Check if input is a number (bank selection by index)
        const bankIndex = parseInt(userInput) - 1;
        if (bankIndex >= 0 && bankIndex < this.ZIMBABWE_BANKS.length) {
            selectedBank = this.ZIMBABWE_BANKS[bankIndex];
        } else {
            // Check if input matches bank name
            selectedBank = this.ZIMBABWE_BANKS.find(bank => 
                bank.toLowerCase().includes(userInput.toLowerCase()) || 
                userInput.toLowerCase().includes(bank.toLowerCase())
            );
        }

        if (selectedBank) {
            session.prazData.bankName = selectedBank;
            session.state = this.PRAZ_STATES.PRAZ_ACCOUNT_NUMBER;

            return {
                type: 'message',
                content: `✅ Bank selected: ${selectedBank}\n\n🔢 Please provide your account number:\n\n*Account Number:*`
            };
        }

        return {
            type: 'message',
            content: `❌ Invalid bank selection. Please choose from the list:\n\n${this.generateBankList()}\n\n*Type the number or bank name:*`
        };
    }

    // Handle account number input
    async handleAccountNumber(userInput, session, phoneNumber) {
        // Basic validation for account number (adjust as needed)
        if (userInput.length >= 8 && /^\d+$/.test(userInput)) {
            session.prazData.accountNumber = userInput;
            session.state = this.PRAZ_STATES.PRAZ_ACCOUNT_HOLDER;

            return {
                type: 'message',
                content: `✅ Account number saved\n\n👤 Please provide the account holder name (as it appears on the bank account):\n\n*Account Holder Name:*`
            };
        }

        return {
            type: 'message',
            content: `❌ Invalid account number. Please provide a valid account number (minimum 8 digits, numbers only):\n\n*Account Number:*`
        };
    }

    // Handle account holder name
    async handleAccountHolder(userInput, session, phoneNumber) {
        if (userInput.length >= 2) {
            session.prazData.accountHolder = userInput;
            session.state = this.PRAZ_STATES.PRAZ_BRANCH_NAME;

            return {
                type: 'message',
                content: `✅ Account holder: ${userInput}\n\n🏢 Please provide the branch name:\n\n*Branch Name:*\n\n*Example: Harare Main Branch, Bulawayo Branch, etc.*`
            };
        }

        return {
            type: 'message',
            content: `❌ Please provide a valid account holder name:\n\n*Account Holder Name:*`
        };
    }

    // Handle branch name input
    async handleBranchName(userInput, session, phoneNumber) {
        if (userInput.length >= 3) {
            session.prazData.branchName = userInput;
            session.state = this.PRAZ_STATES.PRAZ_BRANCH_CODE;

            return {
                type: 'message',
                content: `✅ Branch: ${userInput}\n\n🔢 Please provide the branch code (if available):\n\n*Branch Code:*\n\n*Type 'skip' if you don't have the branch code*`
            };
        }

        return {
            type: 'message',
            content: `❌ Please provide a valid branch name:\n\n*Branch Name:*`
        };
    }

    // Handle branch code input
    async handleBranchCode(userInput, session, phoneNumber) {
        if (userInput.toLowerCase() === 'skip') {
            session.prazData.branchCode = 'Not provided';
        } else {
            session.prazData.branchCode = userInput;
        }

        session.state = this.PRAZ_STATES.PRAZ_ACCOUNT_TYPE;

        return {
            type: 'message',
            content: `✅ Branch code: ${session.prazData.branchCode}\n\n💳 Please select your account type:\n\n${this.generateAccountTypeList()}\n\n*Please type the number or account type:*`
        };
    }

    // Handle account type selection
    async handleAccountType(userInput, session, phoneNumber) {
        let selectedAccountType = null;

        // Check if input is a number (account type selection by index)
        const typeIndex = parseInt(userInput) - 1;
        if (typeIndex >= 0 && typeIndex < this.ACCOUNT_TYPES.length) {
            selectedAccountType = this.ACCOUNT_TYPES[typeIndex];
        } else {
            // Check if input matches account type name
            selectedAccountType = this.ACCOUNT_TYPES.find(type => 
                type.toLowerCase().includes(userInput.toLowerCase())
            );
        }

        if (selectedAccountType) {
            session.prazData.accountType = selectedAccountType;
            session.state = this.PRAZ_STATES.PRAZ_CONFIRMATION;

            return this.generatePrazConfirmationMessage(session);
        }

        return {
            type: 'message',
            content: `❌ Invalid account type selection. Please choose from the list:\n\n${this.generateAccountTypeList()}\n\n*Type the number or account type:*`
        };
    }

    // Handle PRAZ confirmation
    async handlePrazConfirmation(userInput, session, phoneNumber) {
        const input = userInput.toLowerCase();

        if (input === 'confirm' || input === 'yes' || input === '1') {
            // Create PRAZ application via API call
            try {
                const applicationResult = await this.createPrazApplicationViaAPI(session, phoneNumber);
                
                if (applicationResult.success) {
                    session.state = this.PRAZ_STATES.PRAZ_END;
                    session.prazData.applicationId = applicationResult.applicationId;

                    return {
                        type: 'message',
                        content: `🎉 *PRAZ Registration Application Submitted!*\n\n📋 *Application Summary:*\n• Application ID: ${applicationResult.applicationId}\n• Company Email: ${session.prazData.companyEmail}\n• Bank: ${session.prazData.bankName}\n• Account Holder: ${session.prazData.accountHolder}\n• Account Type: ${session.prazData.accountType}\n\n✅ Your PRAZ registration application has been successfully submitted with all banking details.\n\n📞 *Next Steps:*\n• You will receive a confirmation email within 2-3 business days\n• PRAZ will review your application and banking information\n• Processing time: 5-10 business days\n• You'll be notified of approval status via email\n\n🔄 Type 'start' for a new application or 'menu' for main services.`
                    };
                } else {
                    this.debug('API call failed', applicationResult);
                    return {
                        type: 'message',
                        content: `❌ Error creating PRAZ application: ${applicationResult.message}\n\n🔄 Type 'retry' to try again or 'back' to modify information.`
                    };
                }
            } catch (error) {
                this.debug('Error creating PRAZ application via API', error);
                return {
                    type: 'message',
                    content: `❌ Error creating PRAZ application. Please try again or contact support.\n\n🔄 Type 'retry' to try again.`
                };
            }
        }

        if (input === 'edit' || input === 'modify' || input === '2') {
            return await this.startPrazRegistration(session, phoneNumber);
        }

        if (input === 'cancel' || input === '3') {
            // Reset PRAZ data but keep main session
            delete session.prazData;
            session.state = 'company_registration'; // Go back to company registration menu

            return {
                type: 'message',
                content: `❌ PRAZ registration cancelled.\n\n🔄 Returning to Company Registration services.\n\nType 'menu' for main services or select another company registration service.`
            };
        }

        if (input === 'retry') {
            // Try to create application again
            try {
                const applicationResult = await this.createPrazApplicationViaAPI(session, phoneNumber);
                
                if (applicationResult.success) {
                    session.state = this.PRAZ_STATES.PRAZ_END;
                    session.prazData.applicationId = applicationResult.applicationId;

                    return {
                        type: 'message',
                        content: `✅ *PRAZ Registration Application Submitted!*\n\n📋 Application ID: ${applicationResult.applicationId}\n\nYour application has been successfully submitted.`
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
            content: this.generatePrazConfirmationMessage(session).content
        };
    }

    // Handle PRAZ end state
    async handlePrazEnd(userInput, session, phoneNumber) {
        const input = userInput.toLowerCase().trim();

        if (input === 'start' || input === 'menu') {
            // Reset session and return to main menu
            delete session.prazData;
            session.state = 'main_menu';
            
            return {
                type: 'message',
                content: `🔄 Returning to main menu...\n\nType 'menu' to see all available services.`
            };
        }

        return {
            type: 'message',
            content: `🎉 Your PRAZ registration application has been submitted!\n\n🔄 Type 'start' to begin a new application or 'menu' for main services.`
        };
    }

    // Create PRAZ application via API call
    async createPrazApplicationViaAPI(session, phoneNumber) {
        try {
            const prazData = session.prazData || {};
            
            // Prepare application data for API
            const applicationData = {
                applicantPhone: phoneNumber,
                serviceType: 'PRAZ Registration',
                status: 'Pending',
                companyEmail: prazData.companyEmail || 'Not provided',
                bankName: prazData.bankName || 'Not provided',
                accountNumber: prazData.accountNumber || 'Not provided',
                accountHolder: prazData.accountHolder || 'Not provided',
                branchName: prazData.branchName || 'Not provided',
                branchCode: prazData.branchCode || 'Not provided',
                accountType: prazData.accountType || 'Not provided'
            };
            
            this.debug('Calling API to create PRAZ application', {
                url: `${this.API_BASE_URL}/praz_reg_apply`,
                data: applicationData
            });
            
            // Make API call - adjust the endpoint as needed for your PRAZ API
            const response = await axios.post(`${this.API_BASE_URL}/praz_reg_apply`, applicationData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            if (response.data.success) {
                this.debug('PRAZ application created successfully via API', {
                    applicationId: response.data.data._id || response.data.data.id
                });
                
                return {
                    success: true,
                    applicationId: response.data.data._id || response.data.data.id,
                    message: 'PRAZ application created successfully'
                };
            } else {
                this.debug('API returned error', response.data);
                return {
                    success: false,
                    message: response.data.message || 'Failed to create PRAZ application'
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

    // Handle default/fallback for PRAZ flow
    async handlePrazDefault(userInput, session, phoneNumber) {
        const input = userInput.toLowerCase();

        if (input === 'back' || input === 'previous') {
            return this.handlePrazBack(session, phoneNumber);
        }

        if (input === 'cancel' || input === 'exit') {
            delete session.prazData;
            session.state = 'company_registration';

            return {
                type: 'message',
                content: `❌ PRAZ registration cancelled.\n\n🔄 Returning to Company Registration services.`
            };
        }

        if (input === 'help') {
            return {
                type: 'message',
                content: `🆘 *PRAZ Registration Help*\n\nAvailable commands:\n• 'back' - Go to previous step\n• 'cancel' - Cancel PRAZ registration\n• 'help' - Show this help\n\nCurrently collecting: ${this.getCurrentFieldLabel(session)}`
            };
        }

        return {
            type: 'message',
            content: `❓ I didn't understand that.\n\nCurrently collecting: ${this.getCurrentFieldLabel(session)}\n\nType 'help' for available commands or 'cancel' to exit PRAZ registration.`
        };
    }

    // Handle going back in PRAZ flow
    handlePrazBack(session, phoneNumber) {
        const stateOrder = [
            this.PRAZ_STATES.PRAZ_COMPANY_EMAIL,
            this.PRAZ_STATES.PRAZ_BANK_NAME,
            this.PRAZ_STATES.PRAZ_ACCOUNT_NUMBER,
            this.PRAZ_STATES.PRAZ_ACCOUNT_HOLDER,
            this.PRAZ_STATES.PRAZ_BRANCH_NAME,
            this.PRAZ_STATES.PRAZ_BRANCH_CODE,
            this.PRAZ_STATES.PRAZ_ACCOUNT_TYPE,
            this.PRAZ_STATES.PRAZ_CONFIRMATION
        ];

        const currentIndex = stateOrder.indexOf(session.state);
        if (currentIndex > 0) {
            const previousState = stateOrder[currentIndex - 1];
            session.state = previousState;

            // Clear the current field data
            const fieldKey = this.BANKING_FIELDS[currentIndex - 1]?.key;
            if (fieldKey && session.prazData) {
                session.prazData[fieldKey] = '';
            }

            return {
                type: 'message',
                content: `⬅️ Going back to previous step.\n\n${this.getCurrentFieldLabel(session)}`
            };
        }

        // Can't go back further, return to company registration
        delete session.prazData;
        session.state = 'company_registration';

        return {
            type: 'message',
            content: `⬅️ Returning to Company Registration services.\n\nSelect a service or type 'menu' for main services.`
        };
    }

    // Generate bank list for selection
    generateBankList() {
        let bankList = '';
        this.ZIMBABWE_BANKS.forEach((bank, index) => {
            bankList += `${index + 1}. ${bank}\n`;
        });
        return bankList;
    }

    // Generate account type list for selection
    generateAccountTypeList() {
        let typeList = '';
        this.ACCOUNT_TYPES.forEach((type, index) => {
            typeList += `${index + 1}. ${type}\n`;
        });
        return typeList;
    }

    // Generate PRAZ confirmation message
    generatePrazConfirmationMessage(session) {
        const data = session.prazData;
        let message = `📋 *PRAZ Registration - Please Confirm Details*\n\n`;
        message += `🏛️ **PRAZ Registration Application**\n\n`;
        message += `📧 Company Email: ${data.companyEmail}\n\n`;
        message += `🏦 **Banking Details:**\n`;
        message += `• Bank: ${data.bankName}\n`;
        message += `• Account Number: ${data.accountNumber}\n`;
        message += `• Account Holder: ${data.accountHolder}\n`;
        message += `• Branch: ${data.branchName}\n`;
        message += `• Branch Code: ${data.branchCode}\n`;
        message += `• Account Type: ${data.accountType}\n\n`;
        message += `✅ Type 'confirm' to submit your PRAZ application\n`;
        message += `✏️ Type 'edit' to modify information\n`;
        message += `❌ Type 'cancel' to cancel application`;

        return {
            type: 'message',
            content: message
        };
    }

    // Get current field label for help messages
    getCurrentFieldLabel(session) {
        const stateToFieldMap = {
            [this.PRAZ_STATES.PRAZ_COMPANY_EMAIL]: '📧 Company Email Address',
            [this.PRAZ_STATES.PRAZ_BANK_NAME]: '🏦 Bank Name',
            [this.PRAZ_STATES.PRAZ_ACCOUNT_NUMBER]: '🔢 Account Number',
            [this.PRAZ_STATES.PRAZ_ACCOUNT_HOLDER]: '👤 Account Holder Name',
            [this.PRAZ_STATES.PRAZ_BRANCH_NAME]: '🏢 Branch Name',
            [this.PRAZ_STATES.PRAZ_BRANCH_CODE]: '🔢 Branch Code',
            [this.PRAZ_STATES.PRAZ_ACCOUNT_TYPE]: '💳 Account Type'
        };

        return stateToFieldMap[session.state] || 'Information';
    }

    // Email validation helper
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Check if current state is PRAZ-related
    isPrazState(state) {
        return Object.values(this.PRAZ_STATES).includes(state);
    }

    // Get PRAZ registration summary for admin/debugging
    getPrazSummary(session) {
        if (!session.prazData) return null;

        return {
            companyEmail: session.prazData.companyEmail,
            bankName: session.prazData.bankName,
            accountType: session.prazData.accountType,
            progress: this.calculateProgress(session),
            startTime: session.prazData.startTime,
            currentState: session.state,
            applicationId: session.prazData.applicationId
        };
    }

    // Calculate completion progress
    calculateProgress(session) {
        const totalSteps = Object.keys(this.PRAZ_STATES).length - 2; // Exclude START and END
        const currentStepIndex = Object.values(this.PRAZ_STATES).indexOf(session.state);
        return Math.round((currentStepIndex / totalSteps) * 100);
    }
}

module.exports = PrazRegistrationFlow;