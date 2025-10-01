// flowtree.js - WhatsApp Chatbot Flow Tree (Updated with Company Registration Fix)
// This file manages the conversation flow and state for the WhatsApp chatbot

const PrazRegistrationFlow = require("./applyication_flow_services/registration/praz");
const CompanyReRegistrationFlow = require("./applyication_flow_services/registration/re_registration");
const CompanyRegistrationFlow = require("./applyication_flow_services/registration/comp_registration");
const VatRegistrationFlow = require("./applyication_flow_services/registration/vat");
const VendorNumberFlow = require("./applyication_flow_services/registration/ventor_number");
const LicensingFlow = require("./applyication_flow_services/licensing/licencing_flow");
const ITManagementFlow = require("./applyication_flow_services/it_and_information_system/it_system");
const AccountingManagementFlow = require("./applyication_flow_services/accounting_and_management/accounting_management_consultancy");
const AuditAssuranceFlow = require("./applyication_flow_services/audit_and_assuarance/audit_assurance");
const CompanyDeRegistrationFlow = require("./applyication_flow_services/registration/de_registration");
const CollegeRegistrationFlow = require("./applyication_flow_services/registration/college_registration");
const ChurchRegistrationFlow = require("./applyication_flow_services/registration/church_registration");
const BusinessSoftwareFlow = require("./applyication_flow_services/business_software/business_software_intelligence");
const BusinessStrategyFlow = require("./applyication_flow_services/business_strategy/business_strategy");
const MicrosoftSoftwareFlow = require("./applyication_flow_services/microsoft_software/microsoft_software");
const TaxConsultancyFlow = require("./applyication_flow_services/tax_consultancy/tax_consultancy");


class FlowTree {
    constructor() {
        // User session storage (in production, use a database)
        this.userSessions = new Map();

        // Initialize flow handlers
        this.prazFlow = new PrazRegistrationFlow();
        this.reregistrationFlow = new CompanyReRegistrationFlow();
        this.registrationFlow = new CompanyRegistrationFlow();
        this.vatFlow = new VatRegistrationFlow();
        this.vendorFlow = new VendorNumberFlow();
        this.licensingFlow = new LicensingFlow();
        this.itManagementFlow = new ITManagementFlow();
        this.accountingManagementFlow = new AccountingManagementFlow();
        this.auditAssuranceFlow = new AuditAssuranceFlow();
        this.deregistrationFlow = new CompanyDeRegistrationFlow();
        this.collegeFlow = new CollegeRegistrationFlow();
        this.churchFlow = new ChurchRegistrationFlow();
        this.businessSoftwareFlow = new BusinessSoftwareFlow();
        this.businessStrategyFlow = new BusinessStrategyFlow();
        this.microsoftSoftwareFlow = new MicrosoftSoftwareFlow();
        this.taxConsultancyFlow = new TaxConsultancyFlow();



        // Flow states
        this.STATES = {
            START: 'start',
            MAIN_MENU: 'main_menu',
            COMPANY_REGISTRATION: 'company_registration',
            LICENSING: 'licensing',
            TAX_CONSULTANCY: 'tax_consultancy',
            IT_IS_MANAGEMENT: 'it_is_management',
            BUSINESS_SOFTWARE: 'business_software',
            ACCOUNTING_MANAGEMENT: 'accounting_management',
            AUDIT_ASSURANCE: 'audit_assurance',
            MICROSOFT_SERVICES: 'microsoft_services',
            SUB_SERVICES: 'sub_services',
            APPLICATION_PROCESS: 'application_process',
            COLLECT_INFO: 'collect_info',
            CONFIRMATION: 'confirmation',
            BUSINESS_STRATEGY: 'business_strategy',
            MICROSOFT_SERVICES: 'microsoft_services',
            END: 'end'
        };

        // Template IDs from Twilio
        this.TEMPLATES = {
            MAIN_MENU: 'HX1709f2dbf88a5e5cf077a618ada6a8e0',
            COMPANY_REGISTRATION: 'HX7b4e6872461fcb15654fd16777965318',
            LICENSING: 'HXea5ec4982c3dd8cbaac667c79a60de53',
            TAX_CONSULTANCY: 'HX4dfa2cdc77dc9b6e1caebbde44d371c4',
            IT_IS_MANAGEMENT: 'HXc7b4fbad99fe9dc75f48a96a422bfeb2',
            BUSINESS_SOFTWARE: 'HX8404ac62c493dfbb97301e2f35a21fb4',
            ACCOUNTING_MANAGEMENT: 'HX168e6d2f02789f825a371b58125b87be',
            AUDIT_ASSURANCE: 'HX6ebf2d3d216ab02342453a666ee61991',
            MICROSOFT_SERVICES: 'HXf057ef40ecb1b5e7f0c35714ec1bc5dd',
            BUSINESS_STRATEGY: 'HXa4f1174d6825429e34b5db664eb5071b',
            ERROR_RECOVERY: 'HXc1d7091fad11d1b12a8a0da7666d24e5',
        };

        // List Picker Item IDs mapping to states and templates
        this.LIST_PICKER_ITEMS = {
            'Company Registration': {
                state: this.STATES.COMPANY_REGISTRATION,
                templateId: this.TEMPLATES.COMPANY_REGISTRATION
            },
            'Licensing': {
                state: this.STATES.LICENSING,
                templateId: this.TEMPLATES.LICENSING
            },
            'Tax Consultancy': {
                state: this.STATES.TAX_CONSULTANCY,
                templateId: this.TEMPLATES.TAX_CONSULTANCY
            },
            'IT & Information Systems': {
                state: this.STATES.IT_IS_MANAGEMENT,
                templateId: this.TEMPLATES.IT_IS_MANAGEMENT
            },
            'Business Software': {
                state: this.STATES.BUSINESS_SOFTWARE,
                templateId: this.TEMPLATES.BUSINESS_SOFTWARE
            },
            'Accounting & Management': {
                state: this.STATES.ACCOUNTING_MANAGEMENT,
                templateId: this.TEMPLATES.ACCOUNTING_MANAGEMENT
            },
            'Audit & Assurance': {
                state: this.STATES.AUDIT_ASSURANCE,
                templateId: this.TEMPLATES.AUDIT_ASSURANCE
            },
            'Microsoft Services': {
                state: this.STATES.MICROSOFT_SERVICES,
                templateId: this.TEMPLATES.MICROSOFT_SERVICES
            },
            'Business Strategy': {
                state: this.STATES.BUSINESS_STRATEGY,
                templateId: this.TEMPLATES.BUSINESS_STRATEGY
            }

        };

        // Sub-services for each main service
        this.SUB_SERVICES = {
            COMPANY_REGISTRATION: {

                'Church Registration': {
                    templateId: null,
                    state: 'church_start',
                    customFlow: true
                },

                'College Registration': {
                    templateId: null,
                    state: 'college_start',
                    customFlow: true
                },

                'Company De-Registration': {
                    templateId: null,
                    state: 'deregistration_start',
                    customFlow: true
                },
                'Company Registration': {
                    templateId: null,
                    state: 'registration_start',
                    customFlow: true
                },
                'Company Registration2': {
                    templateId: null,
                    state: 'registration_start',
                    customFlow: true
                },
                'Company Re-Registration': {
                    templateId: 'HX04c8e428f3b572f7040f4d09d9e45219',
                    state: 'reregistration_start',
                    customFlow: true
                },
                'Company De-Registration': { templateId: 'HX_template_id', state: 'sub_state' },
                'Vendor Number': {
                    templateId: null,
                    state: 'vendor_start',
                    customFlow: true
                },
                'VAT Registration': {
                    templateId: null,
                    state: 'vat_start',
                    customFlow: true
                },
                'PRAZ Registration': {
                    templateId: null,
                    state: 'praz_start',
                    customFlow: true
                },
                'NASSA Registration': { templateId: 'HX_template_id', state: 'sub_state' },
                'Annual Registration': { templateId: 'HX_template_id', state: 'sub_state' }
            },

            BUSINESS_STRATEGY: {
                'Strategic Planning': {
                    templateId: 'HX_template_id_1',
                    state: 'strategic_planning',
                    customFlow: true
                },
                'Business Plan Development': {
                    templateId: 'HX_template_id_2',
                    state: 'business_plan_development',
                    customFlow: true
                },
                'Market Research': {
                    templateId: 'HX_template_id_3',
                    state: 'market_research',
                    customFlow: true
                },
                'Feasibility Studies': {
                    templateId: 'HX_template_id_4',
                    state: 'feasibility_studies',
                    customFlow: true
                }
            },
            LICENSING: {
                'Liquor license': {
                    templateId: 'HX025966aebeb7702f2c3aa63b6c52b3aa',
                    state: 'liquor_license',
                    customFlow: true
                },
                'Import license': {
                    templateId: 'HXc950df4f8205f26ad575e4bb17878fb1',
                    state: 'import_license',
                    customFlow: true
                },
                'Trading license': {
                    templateId: 'HX4904b0c265a7d6b26786143b2a1d7d7e',
                    state: 'trading_license',
                    customFlow: true
                },
                'Money lending license': {
                    templateId: 'HXd295a6ab98c74ab6d2eff531ebcddbce',
                    state: 'money_lending_license',
                    customFlow: true
                }
            },
            TAX_CONSULTANCY: {
                'Tax Registration': { templateId: 'HXf9a543ac7666d9e645b5cd1f892b5110', state: 'sub_state' },
                'Tax Clearance Renewal': { templateId: 'HX089f2c3265662e6074c76dc03a605473', state: 'sub_state' },
                'Quarterly Payment Dates': { templateId: 'HXa9835b1cb7d278241c81b9b5718a1ab5', state: 'sub_state' },
                'Fiscalisation': { templateId: 'HXaf89da97b803bdc39f6ad00f495bd394', state: 'sub_state' },
                'Fiscal Devices': { templateId: 'HXdc8e4f926f2c95619871973b8358841a', state: 'sub_state' },
                'NSSA Registration': { templateId: 'HXa263a3355f0f11bd317ea7a3faa72cd1', state: 'sub_state' },
                'Tax Advisory': { templateId: 'HX9aee62ae576e4130e15b091961572c30', state: 'sub_state' },
                'Tax Health Check': { templateId: 'HX2cc5f862e54d24ba6552578a03d24ed0', state: 'sub_state' },
            },
            IT_IS_MANAGEMENT: {
                'IT Audit & Consultancy': {
                    templateId: 'HXfb0f36358bcdbca9a7742b5107e2fddf',
                    state: 'it_audit',
                    customFlow: true
                },
                'Software Intelligence': {
                    templateId: 'HX7f301c313989a0f88d494b2e0a2e69dd',
                    state: 'software_intelligence',
                    customFlow: true
                },
                'Systems Installations': {
                    templateId: 'HX98ca59d8a7987209885d081aed32c6e9',
                    state: 'systems_installations',
                    customFlow: true
                },
                'Thermal Printers': {
                    templateId: 'HXad85adb917b23f84a24a2ffdb2924957',
                    state: 'thermal_printers',
                    customFlow: true
                },
            },
            BUSINESS_SOFTWARE: {
                'SAGE Evolution': {
                    templateId: 'HXf734e8cfaeb87168b49ee62b5239c457',
                    state: 'sage_option',
                    customFlow: true
                },
                'Zoho': {
                    templateId: 'HX8acfd5b10ada64cc1e25b412c6457f48',
                    state: 'zoho_option',
                    customFlow: true
                },
                'Bookkeeper license': {
                    templateId: 'HXb0c4db7e93812bd870ea81b6e8c62366',
                    state: 'bookkeeper_option',
                    customFlow: true
                },
                'QuickPro Payroll': {
                    templateId: 'HX2b9b4ad4db8c47d6e79f54ad047b6cf4',
                    state: 'quickpro_payroll_option',
                    customFlow: true
                },
            },
            ACCOUNTING_MANAGEMENT: {
                'Book-keeping Services': {
                    templateId: 'HXaff16f68efc691668fa4829b7e7b63ef',
                    state: 'bookkeeping',
                    customFlow: true
                },
                'Payroll Outsourcing': {
                    templateId: 'HX30c4425ff93ac13f8f762bb50413888e',
                    state: 'payroll',
                    customFlow: true
                },
                'Business Valuations': {
                    templateId: 'HX8da61dca2ef5ce8381381ac9c549d3bd',
                    state: 'business_valuations',
                    customFlow: true
                },
                'Due Diligence': {
                    templateId: 'HX3af01d2a33262e012729490ca6b768ba',
                    state: 'due_diligence',
                    customFlow: true
                },
                'Dividend Certificates': {
                    templateId: 'HXe687dcf68aef4ce312d0531e60823c40',
                    state: 'dividend_certificates',
                    customFlow: true
                }
            },
            AUDIT_ASSURANCE: {
                'External Audits': {
                    templateId: 'HX366b55d806bbca2974244b7628f88264',
                    state: 'external_audits',
                    customFlow: true
                },
                'Internal Audits': {
                    templateId: 'HX855582115e3ad8f0009f7a55253bb874',
                    state: 'internal_audits',
                    customFlow: true
                },
                'Forensic Investigations': {
                    templateId: 'HX5dcd9debb1f76d8827de251fd9499ea3',
                    state: 'forensic_investigations',
                    customFlow: true
                },
                'Special Purpose Audits': {
                    templateId: 'HX442479114fbc359916dd0573bd809a0b',
                    state: 'special_purpose_audits',
                    customFlow: true
                }
            },
            MICROSOFT_SERVICES: {
                'Microsoft Excel': {
                    templateId: 'HX434da9d17a1d3ce040d235694e20cef5',
                    state: 'microsoft_excel',
                    customFlow: true
                },
                '365 Copilot': {
                    templateId: 'HX6cd0df07897dd98a7fea41ab4ef9b29d',
                    state: 'office_365_copilot',
                    customFlow: true
                },
                'Email Server': {
                    templateId: 'HX12894b844ce32feb25f767fc69ce94bf',
                    state: 'email_server',
                    customFlow: true
                }
            }
        };

        // Information collection fields
        this.INFO_FIELDS = ['name', 'email', 'phone', 'company'];

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] FLOWTREE: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Initialize or get user session
    getUserSession(phoneNumber) {
        if (!this.userSessions.has(phoneNumber)) {
            this.userSessions.set(phoneNumber, {
                state: this.STATES.START,
                selectedService: null,
                selectedSubService: null,
                collectedInfo: {},
                currentInfoField: 0,
                history: [],
                prazData: null,
                reregistrationData: null,
                registrationData: null,
                vatData: null,
                vendorData: null,
                licensingData: null,
                itData: null,
                accountingData: null,
                auditData: null,
                churchData: null,
                microsoftData: null,
                taxData: null,
            });
        }
        return this.userSessions.get(phoneNumber);
    }


    // Handle errors from individual flows
    handleFlowError(error, session, phoneNumber) {
        this.debug('Flow error occurred', {
            error: error.message,
            stack: error.stack,
            phoneNumber,
            currentState: session.state
        });

        // Set session to error recovery state
        session.state = 'error_recovery';
        session.errorCount = (session.errorCount || 0) + 1;

        return {
            type: 'template',
            templateSid: this.TEMPLATES.ERROR_RECOVERY,
            variables: {
                error_count: session.errorCount.toString()
            }
        };
    }

    // Reset user session
    resetUserSession(phoneNumber) {
        this.userSessions.delete(phoneNumber);
        this.debug('User session reset', { phoneNumber });
    }

    // Process user input based on current state
    async processInput(message, phoneNumber) {



        try {



            const session = this.getUserSession(phoneNumber);
            const userInput = message.trim().toLowerCase();

            this.debug('Processing input', {
                phoneNumber,
                currentState: session.state,
                userInput,
                originalMessage: message,
                session
            });

            // Add to history
            session.history.push({
                timestamp: new Date().toISOString(),
                input: message,
                state: session.state
            });

            if (this.churchFlow.isChurchState(session.state)) {
                try {
                    this.debug('Delegating to Church Registration flow', { state: session.state });
                    return await this.churchFlow.processChurchInput(message, session, phoneNumber);
                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }



            }

            if (this.collegeFlow.isCollegeState(session.state)) {

                try {
                    this.debug('Delegating to College Registration flow', { state: session.state });
                    return await this.collegeFlow.processCollegeInput(message, session, phoneNumber);
                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }


            }

            // Check if we're in a Company De-Registration flow
            if (this.deregistrationFlow.isDeRegistrationState(session.state)) {

                try {
                    this.debug('Delegating to Company De-Registration flow', { state: session.state });
                    return await this.deregistrationFlow.processDeRegistrationInput(message, session, phoneNumber);
                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }


            }


            // Check if we're in a PRAZ flow
            if (this.prazFlow.isPrazState(session.state)) {

                try {
                    this.debug('Delegating to PRAZ flow', { state: session.state });
                    return await this.prazFlow.processPrazInput(message, session, phoneNumber);

                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }


            }

            if (this.microsoftSoftwareFlow.isMicrosoftSoftwareState(session.state)) {

                try {
                    this.debug('Delegating to Microsoft Software flow', { state: session.state });
                    return await this.microsoftSoftwareFlow.processMicrosoftSoftwareInput(message, session, phoneNumber);
                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }


            }

            if (this.businessSoftwareFlow.isBusinessSoftwareState(session.state)) {

                try {
                    this.debug('Delegating to Business Software flow', { state: session.state });
                    return await this.businessSoftwareFlow.processBusinessSoftwareInput(message, session, phoneNumber);
                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }


            }

            // Check if we're in a Company Re-Registration flow
            if (this.reregistrationFlow.isReRegistrationState(session.state)) {


                try {
                    this.debug('Delegating to Company Re-Registration flow', { state: session.state });
                    return await this.reregistrationFlow.processReRegistrationInput(message, session, phoneNumber);
                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }


            }

            // Check if we're in a Company Registration flow
            if (this.registrationFlow.isRegistrationState(session.state)) {

                try {
                    this.debug('Delegating to Company Registration flow', { state: session.state });
                    return await this.registrationFlow.processRegistrationInput(message, session, phoneNumber);

                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }


            }

            // Check if we're in a VAT Registration flow
            if (this.vatFlow.isVatState(session.state)) {

                try {
                    this.debug('Delegating to VAT Registration flow', { state: session.state });
                    return await this.vatFlow.processVatInput(message, session, phoneNumber);
                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }


            }

            if (this.taxConsultancyFlow.isTaxState(session.state)) {
                try {
                    this.debug('Delegating to Tax Consultancy flow', { state: session.state });
                    return await this.taxConsultancyFlow.processTaxInput(message, session, phoneNumber);
                } catch (error) {
                    this.debug('Error in Tax Consultancy flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }
            }

            // Check if we're in a Vendor Number flow
            if (this.vendorFlow.isVendorState(session.state)) {

                try {
                    this.debug('Delegating to Vendor Number flow', { state: session.state });
                    return await this.vendorFlow.processVendorInput(message, session, phoneNumber);
                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }


            }

            // Check if we're in a Licensing flow
            if (this.licensingFlow.isLicensingState(session.state)) {

                try {
                    this.debug('Delegating to Licensing flow', { state: session.state });
                    return await this.licensingFlow.processLicensingInput(message, session, phoneNumber);
                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }


            }

            // Check if we're in an IT Management flow
            if (this.itManagementFlow.isITState(session.state)) {

                try {
                    this.debug('Delegating to IT Management flow', { state: session.state });
                    return await this.itManagementFlow.processITInput(message, session, phoneNumber);

                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }


            }

            // Check if we're in an Accounting Management flow
            if (this.accountingManagementFlow.isAccountingState(session.state)) {

                try {
                    this.debug('Delegating to Accounting Management flow', { state: session.state });
                    return await this.accountingManagementFlow.processAccountingInput(message, session, phoneNumber);

                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }


            }

            if (this.auditAssuranceFlow.isAuditState(session.state)) {

                try {
                    this.debug('Delegating to Audit & Assurance flow', { state: session.state });
                    return await this.auditAssuranceFlow.processAuditInput(message, session, phoneNumber);

                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }


            }

            if (this.businessStrategyFlow.isBusinessStrategyState(session.state)) {

                try {
                    this.debug('Delegating to Business Strategy flow', { state: session.state });
                    return await this.businessStrategyFlow.processBusinessStrategyInput(message, session, phoneNumber);
                } catch (error) {
                    this.debug('Error in Church flow', error);
                    return this.handleFlowError(error, session, phoneNumber);
                }


            }

            let response;

            try {


                switch (session.state) {




                    case this.STATES.START:
                        response = await this.handleStart(userInput, session, phoneNumber);
                        break;

                    case this.STATES.MAIN_MENU:
                        response = await this.handleMainMenu(message, session, phoneNumber);
                        break;

                    case this.STATES.COMPANY_REGISTRATION:
                    case this.STATES.LICENSING:
                    case this.STATES.TAX_CONSULTANCY:
                    case this.STATES.IT_IS_MANAGEMENT:
                    case this.STATES.BUSINESS_SOFTWARE:
                    case this.STATES.ACCOUNTING_MANAGEMENT:
                    case this.STATES.AUDIT_ASSURANCE:
                    case this.STATES.MICROSOFT_SERVICES:
                        response = await this.handleServiceSelection(message, session, phoneNumber);
                        break;

                    case this.STATES.APPLICATION_PROCESS:
                        response = await this.handleApplicationProcess(userInput, session, phoneNumber);
                        break;

                    case this.STATES.COLLECT_INFO:
                        response = await this.handleInfoCollection(userInput, session, phoneNumber);
                        break;

                    case this.STATES.CONFIRMATION:
                        response = await this.handleConfirmation(userInput, session, phoneNumber);
                        break;

                    default:
                        response = await this.handleDefault(userInput, session, phoneNumber);
                        break;
                }

            } catch (error) {
                this.debug('Error in main state handler', error);
                return this.handleFlowError(error, session, phoneNumber);

            }



            this.debug('Generated response', { response, newState: session.state });
            return response;






        } catch (error) {

            this.debug('Error in processInput', {
                error: error.message,
                stack: error.stack,
                phoneNumber
            });

            // Set session to error recovery state
            const session = this.getUserSession(phoneNumber);
            session.state = 'error_recovery';
            session.errorCount = (session.errorCount || 0) + 1;

            return {
                type: 'template',
                templateSid: this.TEMPLATES.ERROR_RECOVERY,
                variables: {
                    error_count: session.errorCount.toString()
                }
            };

        }


    }




    // Handle error recovery template interactions
    async handleErrorRecovery(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        // Handle quick reply button clicks from error template
        if (userInput === 'menu' || userInput.includes('menu')) {
            session.state = this.STATES.MAIN_MENU;
            session.errorCount = 0;
            return {
                type: 'template',
                templateSid: this.TEMPLATES.MAIN_MENU,
                variables: {}
            };
        }

        if (userInput === 'hi' || userInput === 'hello' || userInput === 'start' || userInput.includes('start')) {
            this.resetUserSession(phoneNumber);
            const newSession = this.getUserSession(phoneNumber);
            newSession.state = this.STATES.MAIN_MENU;
            return {
                type: 'template',
                templateSid: this.TEMPLATES.MAIN_MENU,
                variables: {}
            };
        }

        if (userInput === 'help' || userInput.includes('help')) {
            return {
                type: 'message',
                content: `🆘 *Help - Error Recovery*\n\nI encountered an error. Please try:\n• Click 'Menu' to return to main menu\n• Click 'Start Over' to begin fresh\n• Type 'help' for assistance\n\nIf errors persist, please contact support.`
            };
        }

        // If user sends other messages while in error state, show error template again
        return {
            type: 'template',
            templateSid: this.TEMPLATES.ERROR_RECOVERY,
            variables: {
                error_count: session.errorCount.toString()
            }
        };
    }
















    // Handle start/greeting
    async handleStart(userInput, session, phoneNumber) {
        if (userInput === 'hi' || userInput === 'hello' || userInput === 'start') {
            session.state = this.STATES.MAIN_MENU;
            return {
                type: 'template',
                templateSid: this.TEMPLATES.MAIN_MENU,
                variables: {}
            };
        }

        return {
            type: 'message',
            content: "👋 Welcome! Please say 'hi' or 'hello' to get started with our services."
        };
    }

    // Handle main menu List Picker selections
    // Replace the current handleMainMenu method with this improved version
    async handleMainMenu(message, session, phoneNumber) {
        this.debug('Handling main menu selection', { message, phoneNumber });

        console.log('DEBUG - Main menu received:', JSON.stringify(message));

        // Use fuzzy matching instead of exact matching
        const normalizedInput = message.trim().toLowerCase();
        let selectedItem = null;
        let selectedKey = null;

        // Try to find matching menu item
        for (const [key, item] of Object.entries(this.LIST_PICKER_ITEMS)) {
            if (key.trim().toLowerCase() === normalizedInput) {
                selectedItem = item;
                selectedKey = key;
                break;
            }
        }

        // If exact match not found, try partial match
        if (!selectedItem) {
            for (const [key, item] of Object.entries(this.LIST_PICKER_ITEMS)) {
                if (key.toLowerCase().includes(normalizedInput) || normalizedInput.includes(key.toLowerCase())) {
                    selectedItem = item;
                    selectedKey = key;
                    break;
                }
            }
        }

        if (selectedItem) {
            session.selectedService = selectedKey;
            session.state = selectedItem.state;

            this.debug('Main menu item selected', {
                selectedService: selectedKey,
                newState: selectedItem.state,
                templateId: selectedItem.templateId
            });

            return {
                type: 'template',
                templateSid: selectedItem.templateId,
                variables: {}
            };
        }

        // Handle text input for menu navigation
        const userInput = message.toLowerCase().trim();
        if (userInput === 'menu' || userInput === 'back' || userInput === 'start') {
            return {
                type: 'template',
                templateSid: this.TEMPLATES.MAIN_MENU,
                variables: {}
            };
        }

        return {
            type: 'template',
            templateSid: this.TEMPLATES.ERROR_RECOVERY,
            variables: {
                error_count: session.errorCount.toString(),
                timestamp: new Date().toLocaleTimeString()
            }
        };
    }

    async handleServiceSelection(message, session, phoneNumber) {
        this.debug('Handling service selection', {
            message,
            currentState: session.state,
            selectedService: session.selectedService
        });

        // Get the current service key
        const serviceKey = this.getServiceKeyFromState(session.state);
        const subServices = this.SUB_SERVICES[serviceKey];

        // Debug: Log what we're working with
        this.debug('Service selection details', {
            message,
            serviceKey,
            subServicesKeys: subServices ? Object.keys(subServices) : 'No sub-services',
            exactMatch: subServices ? subServices[message] : 'No sub-services'
        });

        // Check if we have sub-services configured for this service
        if (subServices) {
            // Special handling for College Registration
            if (message === 'College Registration' && subServices['College Registration']) {
                this.debug('Starting College Registration custom flow', { phoneNumber, message });
                session.selectedSubService = 'College Registration';
                return await this.collegeFlow.startCollegeRegistration(session, phoneNumber);
            }

            if (serviceKey === 'TAX_CONSULTANCY' && subServiceConfig.customFlow) {
                this.debug('Starting Tax Consultancy custom flow', { phoneNumber, subService: match.key });
                return await this.taxConsultancyFlow.startTaxSubService(session, phoneNumber, match.key);
            }

            // Special handling for Company Registration variations
            if ((message.includes('Company Registration') || message === 'Company Registration2') && subServices['Company Registration']) {
                this.debug('Starting Company Registration custom flow', { phoneNumber, message });
                session.selectedSubService = 'Company Registration';
                return await this.registrationFlow.startCompanyRegistration(session, phoneNumber);
            }

            if (message === 'Church Registration' && subServices['Church Registration']) {
                this.debug('Starting Church Registration custom flow', { phoneNumber, message });
                session.selectedSubService = 'Church Registration';
                return await this.churchFlow.startChurchRegistration(session, phoneNumber);
            }

            // Try to find matching sub-service
            const match = this.findMatchingSubService(subServices, message);

            if (match) {
                session.selectedSubService = match.key;
                const subServiceConfig = match.config;

                this.debug('Found matching sub-service', {
                    matchedKey: match.key,
                    config: subServiceConfig
                });

                // Special handling for College Registration (also check in match scenario)
                if (match.key === 'College Registration' && subServiceConfig.customFlow) {
                    this.debug('Starting College Registration custom flow via match', { phoneNumber });
                    return await this.collegeFlow.startCollegeRegistration(session, phoneNumber);
                }
                if (match.key === 'Church Registration' && subServiceConfig.customFlow) {
                    this.debug('Starting Church Registration custom flow via match', { phoneNumber });
                    return await this.churchFlow.startChurchRegistration(session, phoneNumber);
                }

                // Special handling for Company Re-Registration
                if (match.key === 'Company Re-Registration' && subServiceConfig.customFlow) {
                    this.debug('Starting Company Re-Registration custom flow', { phoneNumber });
                    return await this.reregistrationFlow.startCompanyReRegistration(session, phoneNumber);
                }

                // Special handling for VAT Registration
                if (match.key === 'VAT Registration' && subServiceConfig.customFlow) {
                    this.debug('Starting VAT Registration custom flow', { phoneNumber });
                    return await this.vatFlow.startVatRegistration(session, phoneNumber);
                }

                // Special handling for Vendor Number
                if (match.key === 'Vendor Number' && subServiceConfig.customFlow) {
                    this.debug('Starting Vendor Number custom flow', { phoneNumber });
                    return await this.vendorFlow.startVendorRegistration(session, phoneNumber);
                }

                // Special handling for PRAZ Registration
                if (match.key === 'PRAZ Registration' && subServiceConfig.customFlow) {
                    this.debug('Starting PRAZ custom flow', { phoneNumber });
                    return await this.prazFlow.startPrazRegistration(session, phoneNumber);
                }

                // Special handling for Licensing types
                if (serviceKey === 'LICENSING' && subServiceConfig.customFlow) {
                    this.debug('Starting Licensing custom flow', { phoneNumber, licenseType: match.key });
                    return await this.licensingFlow.startLicensingApplication(session, phoneNumber, match.key);
                }

                if (serviceKey === 'AUDIT_ASSURANCE' && subServiceConfig.customFlow) {
                    this.debug('Starting Audit & Assurance custom flow', { phoneNumber, subService: match.key });
                    return await this.auditAssuranceFlow.startAuditSubService(session, phoneNumber, match.key);
                }
                if (serviceKey === 'BUSINESS_STRATEGY' && subServiceConfig.customFlow) {
                    this.debug('Starting Business Strategy custom flow', { phoneNumber, subService: match.key });
                    return await this.businessStrategyFlow.startBusinessStrategySubService(session, phoneNumber, match.key);
                }




                // Special handling for IT Management sub-services
                if (serviceKey === 'IT_IS_MANAGEMENT' && subServiceConfig.customFlow) {
                    this.debug('Starting IT Management custom flow', { phoneNumber, subService: match.key });

                    // Check if this is an IT sub-service that should use the ITManagementFlow
                    const itSubServices = ['IT Audit & Consultancy', 'Software Intelligence', 'Systems Installations', 'Thermal Printers'];

                    if (itSubServices.includes(match.key)) {
                        this.debug('Delegating to IT Management flow for sub-service', { subService: match.key });
                        return await this.itManagementFlow.startITSubService(session, phoneNumber, match.key);
                    } else {
                        // For other IT services that might have templates
                        if (subServiceConfig.templateId) {
                            session.state = subServiceConfig.state || this.STATES.APPLICATION_PROCESS;
                            return {
                                type: 'template',
                                templateSid: subServiceConfig.templateId,
                                variables: {}
                            };
                        }
                    }
                }

                if (serviceKey === 'MICROSOFT_SERVICES' && subServiceConfig.customFlow) {
                    this.debug('Starting Microsoft Software custom flow', { phoneNumber, subService: match.key });
                    return await this.microsoftSoftwareFlow.startMicrosoftSoftwareSubService(session, phoneNumber, match.key);
                }

                // Special handling for Business Software sub-services
                if (serviceKey === 'BUSINESS_SOFTWARE') {
                    this.debug('Starting Business Software custom flow', { phoneNumber, subService: match.key });

                    const businessSoftwareSubServices = ['SAGE Evolution', 'Zoho', 'Bookkeeper license', 'QuickPro Payroll'];

                    if (businessSoftwareSubServices.includes(match.key)) {
                        this.debug('Delegating to Business Software flow for sub-service', { subService: match.key });
                        return await this.businessSoftwareFlow.startBusinessSoftwareSubService(session, phoneNumber, match.key);
                    } else {
                        // For other business software services that might have templates
                        if (subServiceConfig.templateId) {
                            session.state = subServiceConfig.state || this.STATES.APPLICATION_PROCESS;
                            return {
                                type: 'template',
                                templateSid: subServiceConfig.templateId,
                                variables: {}
                            };
                        }
                    }
                }
                // Special handling for Accounting Management sub-services
                if (serviceKey === 'ACCOUNTING_MANAGEMENT' && subServiceConfig.customFlow) {
                    this.debug('Starting Accounting Management custom flow', { phoneNumber, subService: match.key });
                    return await this.accountingManagementFlow.startAccountingSubService(session, phoneNumber, match.key);
                }

                // If sub-service has its own template, send it
                if (subServiceConfig.templateId) {
                    session.state = subServiceConfig.state || this.STATES.APPLICATION_PROCESS;
                    return {
                        type: 'template',
                        templateSid: subServiceConfig.templateId,
                        variables: {}
                    };
                } else {
                    // Move to application process
                    session.state = this.STATES.APPLICATION_PROCESS;
                    return {
                        type: 'message',
                        content: `✅ Great! You've selected: *${match.key}* from *${session.selectedService}*\n\n🚀 Let's start the application process.\n\nType 'proceed' to continue or 'back' to choose a different service.`
                    };
                }
            }
        }

        // Handle navigation commands
        const userInput = message.toLowerCase().trim();
        if (userInput === 'back' || userInput === 'menu') {
            session.state = this.STATES.MAIN_MENU;
            return {
                type: 'template',
                templateSid: this.TEMPLATES.MAIN_MENU,
                variables: {}
            };
        }

        if (userInput === 'proceed' || userInput === 'continue') {
            session.state = this.STATES.APPLICATION_PROCESS;
            return {
                type: 'message',
                content: `🚀 Starting application process for *${session.selectedService}*\n\nType 'proceed' to continue with information collection.`
            };
        }

        // Default response for unrecognized input
        return {
            type: 'message',
            content: `📋 You're in the *${session.selectedService}* section.\n\nPlease select from the available options above or:\n• Type 'proceed' to start the application process\n• Type 'back' to return to main menu\n• Type 'help' for assistance`
        };
    }

    // Helper method to find matching sub-service
    findMatchingSubService(subServices, message) {
        const normalizedInput = message.trim().toLowerCase();

        // Exact match
        if (subServices[message]) {
            return { config: subServices[message], key: message };
        }

        // Case-insensitive match
        for (const [key, config] of Object.entries(subServices)) {
            if (key.trim().toLowerCase() === normalizedInput) {
                return { config, key };
            }
        }

        // Partial match (for variations)
        for (const [key, config] of Object.entries(subServices)) {
            if (key.toLowerCase().includes(normalizedInput) || normalizedInput.includes(key.toLowerCase())) {
                return { config, key };
            }
        }

        return null;
    }

    // Helper method to get service key from state
    getServiceKeyFromState(state) {
        const stateToServiceMap = {
            [this.STATES.COMPANY_REGISTRATION]: 'COMPANY_REGISTRATION',
            [this.STATES.LICENSING]: 'LICENSING',
            [this.STATES.TAX_CONSULTANCY]: 'TAX_CONSULTANCY',
            [this.STATES.IT_IS_MANAGEMENT]: 'IT_IS_MANAGEMENT',
            [this.STATES.BUSINESS_SOFTWARE]: 'BUSINESS_SOFTWARE',
            [this.STATES.ACCOUNTING_MANAGEMENT]: 'ACCOUNTING_MANAGEMENT',
            [this.STATES.AUDIT_ASSURANCE]: 'AUDIT_ASSURANCE',
            [this.STATES.MICROSOFT_SERVICES]: 'MICROSOFT_SERVICES'
        };
        return stateToServiceMap[state];
    }

    // Handle application process initiation
    async handleApplicationProcess(userInput, session, phoneNumber) {
        if (userInput === 'proceed' || userInput === 'yes' || userInput === 'continue') {
            session.state = this.STATES.COLLECT_INFO;
            session.currentInfoField = 0;

            const serviceName = session.selectedSubService || session.selectedService;
            return {
                type: 'message',
                content: `📝 *Application for ${serviceName}*\n\nI need to collect some information from you. Let's start:\n\n👤 Please provide your full name:`
            };
        }

        if (userInput === 'back') {
            // Determine where to go back to
            if (session.selectedSubService) {
                // Go back to service selection
                const serviceKey = this.getServiceKeyFromState(session.state);
                const templateId = this.TEMPLATES[serviceKey];
                session.selectedSubService = null;

                return {
                    type: 'template',
                    templateSid: templateId,
                    variables: {}
                };
            } else {
                // Go back to main menu
                session.state = this.STATES.MAIN_MENU;
                session.selectedService = null;

                return {
                    type: 'template',
                    templateSid: this.TEMPLATES.MAIN_MENU,
                    variables: {}
                };
            }
        }

        const serviceName = session.selectedSubService || session.selectedService;
        return {
            type: 'message',
            content: `Please type 'proceed' to start the application process for *${serviceName}* or 'back' to choose a different service.`
        };
    }

    // Handle information collection
    async handleInfoCollection(userInput, session, phoneNumber) {
        const fields = ['name', 'email', 'phone', 'company'];
        const fieldLabels = ['👤 Full Name', '📧 Email Address', '📱 Phone Number', '🏢 Company Name'];
        const currentField = fields[session.currentInfoField];

        if (userInput.trim()) {
            // Store the information
            session.collectedInfo[currentField] = userInput.trim();
            session.currentInfoField++;

            // Check if we have collected all information
            if (session.currentInfoField >= fields.length) {
                session.state = this.STATES.CONFIRMATION;
                return this.generateConfirmationMessage(session);
            } else {
                // Ask for next field
                const nextField = fieldLabels[session.currentInfoField];
                return {
                    type: 'message',
                    content: `✅ Thank you! Now please provide your ${nextField.split(' ')[1].toLowerCase()}:\n\n${nextField}:`
                };
            }
        }

        return {
            type: 'message',
            content: `Please provide your ${fieldLabels[session.currentInfoField].split(' ')[1].toLowerCase()}:`
        };
    }

    // Handle confirmation
    async handleConfirmation(userInput, session, phoneNumber) {
        if (userInput === 'confirm' || userInput === 'yes' || userInput === '1') {
            session.state = this.STATES.END;
            const serviceName = session.selectedSubService || session.selectedService;
            return {
                type: 'message',
                content: `🎉 *Application Submitted Successfully!*\n\n📋 Service: ${serviceName}\n👤 Name: ${session.collectedInfo.name}\n\n✅ Your application has been received and is being processed.\n\n📞 We will contact you within 2-3 business days with updates.\n\n🔄 Type 'start' to begin a new application or 'menu' for main services.`
            };
        }

        if (userInput === 'edit' || userInput === 'modify' || userInput === '2') {
            session.state = this.STATES.COLLECT_INFO;
            session.currentInfoField = 0;
            session.collectedInfo = {};
            return {
                type: 'message',
                content: `📝 Let's collect your information again.\n\n👤 Please provide your full name:`
            };
        }

        if (userInput === 'cancel' || userInput === '3') {
            this.resetUserSession(phoneNumber);
            return {
                type: 'message',
                content: `❌ Application cancelled.\n\n🔄 Type 'start' to begin again or 'menu' for main services.`
            };
        }

        return {
            type: 'message',
            content: this.generateConfirmationMessage(session).content
        };
    }

    // Handle default/fallback
    async handleDefault(userInput, session, phoneNumber) {
        if (userInput === 'start' || userInput === 'menu') {
            session.state = this.STATES.MAIN_MENU;
            return {
                type: 'template',
                templateSid: this.TEMPLATES.MAIN_MENU,
                variables: {}
            };
        }

        if (userInput === 'help') {
            return {
                type: 'message',
                content: `🆘 *Help*\n\nAvailable commands:\n• 'start' or 'menu' - Main services menu\n• 'back' - Go to previous step\n• 'help' - Show this help message\n• 'reset' - Start over\n\nCurrently you are in: ${session.state}`
            };
        }

        if (userInput === 'reset') {
            this.resetUserSession(phoneNumber);
            return {
                type: 'message',
                content: "🔄 Session reset. Type 'start' or 'hello' to begin."
            };
        }

        return {
            type: 'message',
            content: "❓ I didn't understand that. Type 'help' for available commands or 'menu' for main services."
        };
    }

    // Generate main services menu (fallback for when templates fail)
    getMainServicesMenu() {
        let menu = "🏢 *Welcome to Our Business Services*\n\n📋 Please select a service:\n\n";
        const services = Object.keys(this.LIST_PICKER_ITEMS);
        services.forEach((service, index) => {
            menu += `${index + 1}. ${service}\n`;
        });
        menu += "\n📝 Please use the interactive menu above or type 'help' for assistance";
        return menu;
    }

    // Generate confirmation message
    generateConfirmationMessage(session) {
        const info = session.collectedInfo;
        const serviceName = session.selectedSubService || session.selectedService;
        let message = `📋 *Please Confirm Your Application Details*\n\n`;
        message += `🔹 Service: ${serviceName}\n`;
        message += `🔹 Name: ${info.name}\n`;
        message += `🔹 Email: ${info.email}\n`;
        message += `🔹 Phone: ${info.phone}\n`;
        message += `🔹 Company: ${info.company}\n\n`;
        message += `✅ Type 'confirm' to submit\n`;
        message += `✏️ Type 'edit' to modify information\n`;
        message += `❌ Type 'cancel' to cancel application`;

        return {
            type: 'message',
            content: message
        };
    }

    // Method to add sub-services dynamically
    addSubService(mainService, itemId, templateId, stateName = null) {
        const serviceKey = mainService.toUpperCase().replace(/\s+/g, '_').replace('&', '');

        if (!this.SUB_SERVICES[serviceKey]) {
            this.SUB_SERVICES[serviceKey] = {};
        }

        this.SUB_SERVICES[serviceKey][itemId] = {
            templateId: templateId,
            state: stateName || this.STATES.APPLICATION_PROCESS
        };

        this.debug('Sub-service added', {
            mainService: serviceKey,
            itemId: itemId,
            templateId: templateId,
            state: stateName
        });
    }

    // Method to add custom flow sub-services
    addCustomFlowSubService(mainService, itemId, stateName, customFlow = true) {
        const serviceKey = mainService.toUpperCase().replace(/\s+/g, '_').replace('&', '');

        if (!this.SUB_SERVICES[serviceKey]) {
            this.SUB_SERVICES[serviceKey] = {};
        }

        this.SUB_SERVICES[serviceKey][itemId] = {
            templateId: null,
            state: stateName,
            customFlow: customFlow
        };

        this.debug('Custom flow sub-service added', {
            mainService: serviceKey,
            itemId: itemId,
            state: stateName,
            customFlow: customFlow
        });
    }

    // Get user session info (for debugging)
    getSessionInfo(phoneNumber) {
        const session = this.userSessions.get(phoneNumber);
        if (!session) return null;

        // Include all flow summaries
        const prazSummary = this.prazFlow.isPrazState(session.state)
            ? this.prazFlow.getPrazSummary(session)
            : null;

        const microsoftSummary = this.microsoftSoftwareFlow.isMicrosoftSoftwareState(session.state)
            ? this.microsoftSoftwareFlow.getMicrosoftSoftwareSummary(session)
            : null;

        const reregistrationSummary = this.reregistrationFlow.isReRegistrationState(session.state)
            ? this.reregistrationFlow.getReRegistrationSummary(session)
            : null;

        const registrationSummary = this.registrationFlow.isRegistrationState(session.state)
            ? this.registrationFlow.getRegistrationSummary(session)
            : null;

        const vatSummary = this.vatFlow.isVatState(session.state)
            ? this.vatFlow.getVatSummary(session)
            : null;

        const vendorSummary = this.vendorFlow.isVendorState(session.state)
            ? this.vendorFlow.getVendorSummary(session)
            : null;

        const licensingSummary = this.licensingFlow.isLicensingState(session.state)
            ? this.licensingFlow.getLicensingSummary(session)
            : null;

        const itSummary = this.itManagementFlow.isITState(session.state)
            ? this.itManagementFlow.getITSummary(session)
            : null;

        const accountingSummary = this.accountingManagementFlow.isAccountingState(session.state)
            ? this.accountingManagementFlow.getAccountingSummary(session)
            : null;

        const auditSummary = this.auditAssuranceFlow.isAuditState(session.state)
            ? this.auditAssuranceFlow.getAuditSummary(session)
            : null;

        return {
            ...session,
            prazSummary,
            reregistrationSummary,
            registrationSummary,
            vatSummary,
            vendorSummary,
            licensingSummary,
            itSummary,
            accountingSummary,
            auditSummary,
            microsoftSummary,
        };
    }

    // Get all active sessions (for debugging)
    getAllSessions() {
        return Array.from(this.userSessions.entries()).map(([phone, session]) => ({
            phone,
            state: session.state,
            isErrorState: session.state === 'error_recovery',
            errorCount: session.errorCount || 0,
            selectedService: session.selectedService,
            selectedSubService: session.selectedSubService,
            isPrazFlow: this.prazFlow.isPrazState(session.state),
            isReregistrationFlow: this.reregistrationFlow.isReRegistrationState(session.state),
            isRegistrationFlow: this.registrationFlow.isRegistrationState(session.state),
            isVatFlow: this.vatFlow.isVatState(session.state),
            isVendorFlow: this.vendorFlow.isVendorState(session.state),
            isLicensingFlow: this.licensingFlow.isLicensingState(session.state),
            isITFlow: this.itManagementFlow.isITState(session.state),
            isAccountingFlow: this.accountingManagementFlow.isAccountingState(session.state),
            isAuditFlow: this.auditAssuranceFlow.isAuditState(session.state),
            isDeRegistrationFlow: this.deregistrationFlow.isDeRegistrationState(session.state),
            isCollegeFlow: this.collegeFlow.isCollegeState(session.state),
            isChurchFlow: this.churchFlow.isChurchState(session.state),
            isBusinessSoftwareFlow: this.businessSoftwareFlow.isBusinessSoftwareState(session.state),
            isBusinessStrategyFlow: this.businessStrategyFlow.isBusinessStrategyState(session.state),
            isMicrosoftFlow: this.microsoftSoftwareFlow.isMicrosoftSoftwareState(session.state),
            isTaxFlow: this.taxConsultancyFlow.isTaxState(session.state),





            prazProgress: this.prazFlow.isPrazState(session.state)
                ? this.prazFlow.calculateProgress(session)
                : null,

            taxProgress: this.taxConsultancyFlow.isTaxState(session.state)
                ? this.taxConsultancyFlow.calculateProgress(session)
                : null,

            businessStrategyProgress: this.businessStrategyFlow.isBusinessStrategyState(session.state)
                ? this.businessStrategyFlow.calculateProgress(session)
                : null,

            businessSoftwareProgress: this.businessSoftwareFlow.isBusinessSoftwareState(session.state)
                ? this.businessSoftwareFlow.calculateProgress(session)
                : null,

            churchProgress: this.churchFlow.isChurchState(session.state)
                ? this.churchFlow.calculateProgress(session)
                : null,
            reregistrationProgress: this.reregistrationFlow.isReRegistrationState(session.state)
                ? this.reregistrationFlow.calculateProgress(session)
                : null,

            collegeProgress: this.collegeFlow.isCollegeState(session.state)
                ? this.collegeFlow.calculateProgress(session)
                : null,
            registrationProgress: this.registrationFlow.isRegistrationState(session.state)
                ? this.registrationFlow.calculateProgress(session)
                : null,
            vatProgress: this.vatFlow.isVatState(session.state)
                ? this.vatFlow.calculateProgress(session)
                : null,
            vendorProgress: this.vendorFlow.isVendorState(session.state)
                ? this.vendorFlow.calculateProgress(session)
                : null,
            licensingProgress: this.licensingFlow.isLicensingState(session.state)
                ? this.licensingFlow.calculateProgress(session)
                : null,
            itProgress: this.itManagementFlow.isITState(session.state)
                ? this.itManagementFlow.calculateProgress(session)
                : null,
            accountingProgress: this.accountingManagementFlow.isAccountingState(session.state)
                ? this.accountingManagementFlow.calculateProgress(session)
                : null,
            auditProgress: this.auditAssuranceFlow.isAuditState(session.state)
                ? this.auditAssuranceFlow.calculateProgress(session)
                : null,

            microsoftProgress: this.microsoftSoftwareFlow.isMicrosoftSoftwareState(session.state)
                ? this.microsoftSoftwareFlow.calculateProgress(session)
                : null,

            deregistrationProgress: this.deregistrationFlow.isDeRegistrationState(session.state)
                ? this.deregistrationFlow.calculateProgress(session)
                : null,
        }));
    }

    getAuditApplications() {
        const auditSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.auditData || this.auditAssuranceFlow.isAuditState(session.state)) {
                auditSessions.push({
                    phoneNumber,
                    summary: this.auditAssuranceFlow.getAuditSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return auditSessions;
    }

    // Method to handle PRAZ-specific admin queries
    getPrazRegistrations() {
        const prazSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.prazData || this.prazFlow.isPrazState(session.state)) {
                prazSessions.push({
                    phoneNumber,
                    summary: this.prazFlow.getPrazSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return prazSessions;
    }

    getMicrosoftApplications() {
        const microsoftSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.microsoftData || this.microsoftSoftwareFlow.isMicrosoftSoftwareState(session.state)) {
                microsoftSessions.push({
                    phoneNumber,
                    summary: this.microsoftSoftwareFlow.getMicrosoftSoftwareSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return microsoftSessions;
    }

    getBusinessStrategyApplications() {
        const businessStrategySessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.businessStrategyData || this.businessStrategyFlow.isBusinessStrategyState(session.state)) {
                businessStrategySessions.push({
                    phoneNumber,
                    summary: this.businessStrategyFlow.getBusinessStrategySummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return businessStrategySessions;
    }

    getTaxApplications() {
        const taxSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.taxData || this.taxConsultancyFlow.isTaxState(session.state)) {
                taxSessions.push({
                    phoneNumber,
                    summary: this.taxConsultancyFlow.getTaxSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return taxSessions;
    }

    getBusinessSoftwareApplications() {
        const businessSoftwareSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.businessSoftwareData || this.businessSoftwareFlow.isBusinessSoftwareState(session.state)) {
                businessSoftwareSessions.push({
                    phoneNumber,
                    summary: this.businessSoftwareFlow.getBusinessSoftwareSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return businessSoftwareSessions;
    }


    getChurchRegistrations() {
        const churchSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.churchData || this.churchFlow.isChurchState(session.state)) {
                churchSessions.push({
                    phoneNumber,
                    summary: this.churchFlow.getChurchSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return churchSessions;
    }


    getCollegeRegistrations() {
        const collegeSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.collegeData || this.collegeFlow.isCollegeState(session.state)) {
                collegeSessions.push({
                    phoneNumber,
                    summary: this.collegeFlow.getCollegeSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return collegeSessions;
    }

    // Method to handle Company Re-Registration admin queries
    getReRegistrations() {
        const reregistrationSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.reregistrationData || this.reregistrationFlow.isReRegistrationState(session.state)) {
                reregistrationSessions.push({
                    phoneNumber,
                    summary: this.reregistrationFlow.getReRegistrationSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return reregistrationSessions;
    }

    // Method to handle Company De-Registration admin queries
    getDeRegistrations() {
        const deregistrationSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.deregistrationData || this.deregistrationFlow.isDeRegistrationState(session.state)) {
                deregistrationSessions.push({
                    phoneNumber,
                    summary: this.deregistrationFlow.getDeRegistrationSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return deregistrationSessions;
    }

    // Method to handle Company Registration admin queries
    getRegistrations() {
        const registrationSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.registrationData || this.registrationFlow.isRegistrationState(session.state)) {
                registrationSessions.push({
                    phoneNumber,
                    summary: this.registrationFlow.getRegistrationSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return registrationSessions;
    }

    // Method to handle VAT Registration admin queries
    getVatRegistrations() {
        const vatSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.vatData || this.vatFlow.isVatState(session.state)) {
                vatSessions.push({
                    phoneNumber,
                    summary: this.vatFlow.getVatSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return vatSessions;
    }

    // Method to handle Vendor Number admin queries
    getVendorRegistrations() {
        const vendorSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.vendorData || this.vendorFlow.isVendorState(session.state)) {
                vendorSessions.push({
                    phoneNumber,
                    summary: this.vendorFlow.getVendorSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return vendorSessions;
    }

    // Method to handle Licensing admin queries
    getLicensingApplications() {
        const licensingSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.licensingData || this.licensingFlow.isLicensingState(session.state)) {
                licensingSessions.push({
                    phoneNumber,
                    summary: this.licensingFlow.getLicensingSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return licensingSessions;
    }

    // Method to handle IT Management admin queries
    getITApplications() {
        const itSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.itData || this.itManagementFlow.isITState(session.state)) {
                itSessions.push({
                    phoneNumber,
                    summary: this.itManagementFlow.getITSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return itSessions;
    }

    // Method to handle Accounting Management admin queries
    getAccountingApplications() {
        const accountingSessions = [];

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            if (session.accountingData || this.accountingManagementFlow.isAccountingState(session.state)) {
                accountingSessions.push({
                    phoneNumber,
                    summary: this.accountingManagementFlow.getAccountingSummary(session),
                    state: session.state,
                    timestamp: session.history[session.history.length - 1]?.timestamp
                });
            }
        }

        return accountingSessions;
    }

    // Clean up completed sessions (call periodically)
    cleanupCompletedSessions(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
        const now = new Date().getTime();
        let cleanedCount = 0;

        for (const [phoneNumber, session] of this.userSessions.entries()) {
            // Clean PRAZ sessions
            if (session.state === this.prazFlow.PRAZ_STATES?.PRAZ_END && session.prazData) {
                const sessionTime = new Date(session.prazData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                    continue;
                }
            }

            // Clean Re-Registration sessions
            if (session.state === this.reregistrationFlow.REREGISTRATION_STATES?.REREGISTRATION_END && session.reregistrationData) {
                const sessionTime = new Date(session.reregistrationData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                    continue;
                }
            }

            if (session.state === this.businessSoftwareFlow.BUSINESS_SOFTWARE_STATES?.BUSINESS_SOFTWARE_END && session.businessSoftwareData) {
                const sessionTime = new Date(session.businessSoftwareData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                }
            }

            if (session.state === this.collegeFlow.COLLEGE_STATES?.COLLEGE_END && session.collegeData) {
                const sessionTime = new Date(session.collegeData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                }
            }

            if (session.state === this.taxConsultancyFlow.TAX_STATES?.TAX_END && session.taxData) {
                const sessionTime = new Date(session.taxData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                }
            }

            if (session.state === this.churchFlow.CHURCH_STATES?.CHURCH_END && session.churchData) {
                const sessionTime = new Date(session.churchData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                }
            }

            if (session.state === this.deregistrationFlow.DEREGISTRATION_STATES?.DEREGISTRATION_END && session.deregistrationData) {
                const sessionTime = new Date(session.deregistrationData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                    continue;
                }
            }

            // Clean Registration sessions
            if (session.state === this.registrationFlow.REGISTRATION_STATES?.REGISTRATION_END && session.registrationData) {
                const sessionTime = new Date(session.registrationData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                    continue;
                }
            }

            // Clean VAT Registration sessions
            if (session.state === this.vatFlow.VAT_STATES?.VAT_END && session.vatData) {
                const sessionTime = new Date(session.vatData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                    continue;
                }
            }

            // Clean Vendor Number sessions
            if (session.state === this.vendorFlow.VENDOR_STATES?.VENDOR_END && session.vendorData) {
                const sessionTime = new Date(session.vendorData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                    continue;
                }
            }

            if (session.state === this.businessStrategyFlow.BUSINESS_STRATEGY_STATES?.STRATEGY_END && session.businessStrategyData) {
                const sessionTime = new Date(session.businessStrategyData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                }
            }

            // Clean Licensing sessions
            if (session.state === this.licensingFlow.LICENSING_STATES?.LICENSING_END && session.licensingData) {
                const sessionTime = new Date(session.licensingData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                    continue;
                }
            }

            // Clean IT Management sessions
            if (session.state === this.itManagementFlow.IT_STATES?.IT_END && session.itData) {
                const sessionTime = new Date(session.itData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                    continue;
                }
            }

            if (session.state === this.microsoftSoftwareFlow.MICROSOFT_SOFTWARE_STATES?.MICROSOFT_SOFTWARE_END && session.microsoftData) {
                const sessionTime = new Date(session.microsoftData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                    continue;
                }
            }

            // Clean Accounting Management sessions
            if (session.state === this.accountingManagementFlow.ACCOUNTING_STATES?.ACCOUNTING_END && session.accountingData) {
                const sessionTime = new Date(session.accountingData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                }
            }

            if (session.state === this.auditAssuranceFlow.AUDIT_STATES?.AUDIT_END && session.auditData) {
                const sessionTime = new Date(session.auditData.startTime).getTime();
                if (now - sessionTime > maxAge) {
                    this.userSessions.delete(phoneNumber);
                    cleanedCount++;
                }
            }

            if (session.state === 'error_recovery') {
                const lastInteraction = session.history[session.history.length - 1]?.timestamp;
                if (lastInteraction) {
                    const sessionTime = new Date(lastInteraction).getTime();
                    if (now - sessionTime > (60 * 60 * 1000)) { // 1 hour
                        this.userSessions.delete(phoneNumber);
                        cleanedCount++;
                        continue;
                    }
                }
            }
        }

        if (cleanedCount > 0) {
            this.debug(`Cleaned up ${cleanedCount} completed sessions`);
        }

        return cleanedCount;
    }
}

module.exports = FlowTree;