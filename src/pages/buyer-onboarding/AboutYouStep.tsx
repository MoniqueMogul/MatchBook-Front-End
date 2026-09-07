import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useBuyerOnboardingStore } from '../../store/useBuyerOnboardingStore';
import { BrandLogo } from '../../components/onboarding/BrandLogo';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { TextInput } from '../../components/onboarding/TextInput';
import { SelectField, type SelectOption } from '../../components/onboarding/SelectField';
import { PhoneInputField } from '../../components/onboarding/PhoneInputField';

import './AboutYouStep.css';

// ── Validation schema ──
const aboutYouSchema = yup.object({
  fullName: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  country: yup.string().required('Country is required'),
  state: yup.string().required('State is required'),
  phoneCountryCode: yup.string().required(),
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(/^\d{3}-\d{3}-\d{4}$/, 'Enter a valid 10-digit phone number'),
});

type AboutYouFormValues = yup.InferType<typeof aboutYouSchema>;

// ── Option data ──
const COUNTRY_OPTIONS: SelectOption[] = [
  { value: 'United States', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'India', label: 'India' },
];

const STATES_BY_COUNTRY: Record<string, SelectOption[]> = {
  'United States': [
    { value: 'Alabama', label: 'Alabama' },
    { value: 'Alaska', label: 'Alaska' },
    { value: 'Arizona', label: 'Arizona' },
    { value: 'Arkansas', label: 'Arkansas' },
    { value: 'California', label: 'California' },
    { value: 'Colorado', label: 'Colorado' },
    { value: 'Connecticut', label: 'Connecticut' },
    { value: 'Delaware', label: 'Delaware' },
    { value: 'Florida', label: 'Florida' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Hawaii', label: 'Hawaii' },
    { value: 'Idaho', label: 'Idaho' },
    { value: 'Illinois', label: 'Illinois' },
    { value: 'Indiana', label: 'Indiana' },
    { value: 'Iowa', label: 'Iowa' },
    { value: 'Kansas', label: 'Kansas' },
    { value: 'Kentucky', label: 'Kentucky' },
    { value: 'Louisiana', label: 'Louisiana' },
    { value: 'Maine', label: 'Maine' },
    { value: 'Maryland', label: 'Maryland' },
    { value: 'Massachusetts', label: 'Massachusetts' },
    { value: 'Michigan', label: 'Michigan' },
    { value: 'Minnesota', label: 'Minnesota' },
    { value: 'Mississippi', label: 'Mississippi' },
    { value: 'Missouri', label: 'Missouri' },
    { value: 'Montana', label: 'Montana' },
    { value: 'Nebraska', label: 'Nebraska' },
    { value: 'Nevada', label: 'Nevada' },
    { value: 'New Hampshire', label: 'New Hampshire' },
    { value: 'New Jersey', label: 'New Jersey' },
    { value: 'New Mexico', label: 'New Mexico' },
    { value: 'New York', label: 'New York' },
    { value: 'North Carolina', label: 'North Carolina' },
    { value: 'North Dakota', label: 'North Dakota' },
    { value: 'Ohio', label: 'Ohio' },
    { value: 'Oklahoma', label: 'Oklahoma' },
    { value: 'Oregon', label: 'Oregon' },
    { value: 'Pennsylvania', label: 'Pennsylvania' },
    { value: 'Rhode Island', label: 'Rhode Island' },
    { value: 'South Carolina', label: 'South Carolina' },
    { value: 'South Dakota', label: 'South Dakota' },
    { value: 'Tennessee', label: 'Tennessee' },
    { value: 'Texas', label: 'Texas' },
    { value: 'Utah', label: 'Utah' },
    { value: 'Vermont', label: 'Vermont' },
    { value: 'Virginia', label: 'Virginia' },
    { value: 'Washington', label: 'Washington' },
    { value: 'West Virginia', label: 'West Virginia' },
    { value: 'Wisconsin', label: 'Wisconsin' },
    { value: 'Wyoming', label: 'Wyoming' },
  ],
  Canada: [
    { value: 'Alberta', label: 'Alberta' },
    { value: 'British Columbia', label: 'British Columbia' },
    { value: 'Manitoba', label: 'Manitoba' },
    { value: 'New Brunswick', label: 'New Brunswick' },
    { value: 'Newfoundland and Labrador', label: 'Newfoundland and Labrador' },
    { value: 'Northwest Territories', label: 'Northwest Territories' },
    { value: 'Nova Scotia', label: 'Nova Scotia' },
    { value: 'Nunavut', label: 'Nunavut' },
    { value: 'Ontario', label: 'Ontario' },
    { value: 'Prince Edward Island', label: 'Prince Edward Island' },
    { value: 'Quebec', label: 'Quebec' },
    { value: 'Saskatchewan', label: 'Saskatchewan' },
    { value: 'Yukon', label: 'Yukon' },
  ],
  'United Kingdom': [
    { value: 'England', label: 'England' },
    { value: 'Scotland', label: 'Scotland' },
    { value: 'Wales', label: 'Wales' },
    { value: 'Northern Ireland', label: 'Northern Ireland' },
  ],
  Australia: [
    { value: 'Australian Capital Territory', label: 'Australian Capital Territory' },
    { value: 'New South Wales', label: 'New South Wales' },
    { value: 'Northern Territory', label: 'Northern Territory' },
    { value: 'Queensland', label: 'Queensland' },
    { value: 'South Australia', label: 'South Australia' },
    { value: 'Tasmania', label: 'Tasmania' },
    { value: 'Victoria', label: 'Victoria' },
    { value: 'Western Australia', label: 'Western Australia' },
  ],
  Germany: [
    { value: 'Baden-Württemberg', label: 'Baden-Württemberg' },
    { value: 'Bavaria', label: 'Bavaria' },
    { value: 'Berlin', label: 'Berlin' },
    { value: 'Brandenburg', label: 'Brandenburg' },
    { value: 'Bremen', label: 'Bremen' },
    { value: 'Hamburg', label: 'Hamburg' },
    { value: 'Hesse', label: 'Hesse' },
    { value: 'Lower Saxony', label: 'Lower Saxony' },
    { value: 'Mecklenburg-Vorpommern', label: 'Mecklenburg-Vorpommern' },
    { value: 'North Rhine-Westphalia', label: 'North Rhine-Westphalia' },
    { value: 'Rhineland-Palatinate', label: 'Rhineland-Palatinate' },
    { value: 'Saarland', label: 'Saarland' },
    { value: 'Saxony', label: 'Saxony' },
    { value: 'Saxony-Anhalt', label: 'Saxony-Anhalt' },
    { value: 'Schleswig-Holstein', label: 'Schleswig-Holstein' },
    { value: 'Thuringia', label: 'Thuringia' },
  ],
  France: [
    { value: 'Auvergne-Rhône-Alpes', label: 'Auvergne-Rhône-Alpes' },
    { value: 'Bourgogne-Franche-Comté', label: 'Bourgogne-Franche-Comté' },
    { value: 'Brittany', label: 'Brittany' },
    { value: 'Centre-Val de Loire', label: 'Centre-Val de Loire' },
    { value: 'Corsica', label: 'Corsica' },
    { value: 'Grand Est', label: 'Grand Est' },
    { value: 'Hauts-de-France', label: 'Hauts-de-France' },
    { value: 'Île-de-France', label: 'Île-de-France' },
    { value: 'Normandy', label: 'Normandy' },
    { value: 'Nouvelle-Aquitaine', label: 'Nouvelle-Aquitaine' },
    { value: 'Occitanie', label: 'Occitanie' },
    { value: 'Pays de la Loire', label: 'Pays de la Loire' },
    { value: "Provence-Alpes-Côte d'Azur", label: "Provence-Alpes-Côte d'Azur" },
  ],
  India: [
    { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
    { value: 'Assam', label: 'Assam' },
    { value: 'Bihar', label: 'Bihar' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Goa', label: 'Goa' },
    { value: 'Gujarat', label: 'Gujarat' },
    { value: 'Haryana', label: 'Haryana' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Kerala', label: 'Kerala' },
    { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Rajasthan', label: 'Rajasthan' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Telangana', label: 'Telangana' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'West Bengal', label: 'West Bengal' },
  ],
};

// ── Component ──
const AboutYouStep: React.FC = () => {
  const navigate = useNavigate();
  const { aboutYou, setAboutYou, nextStep, currentStep, totalSteps } =
    useBuyerOnboardingStore();

  const progress = Math.round((currentStep / totalSteps) * 100);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<AboutYouFormValues>({
    resolver: yupResolver(aboutYouSchema),
    defaultValues: {
      fullName: aboutYou.fullName,
      country: aboutYou.country,
      state: aboutYou.state,
      phoneCountryCode: aboutYou.phoneCountryCode,
      phoneNumber: aboutYou.phoneNumber,
    },
  });

  const selectedCountry = useWatch({ control, name: 'country' });
  const isFirstRender = useRef(true);

  // Dynamically get states/regions for the selected country
  const availableStates = STATES_BY_COUNTRY[selectedCountry] || [];

  // Reset state selection when country changes (except on initial load)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setValue('state', '');
  }, [selectedCountry, setValue]);

  const onSubmit = useCallback(
    (data: AboutYouFormValues) => {
      setAboutYou(data);
      nextStep();
      console.log('✅ About You — Step 1 payload:', data);
      console.log('🔗 Ready for POST /buyers. Advancing to Step 2.');
    },
    [setAboutYou, nextStep]
  );

  const handleBack = useCallback(() => {
    navigate('/role-selection');
  }, [navigate]);

  return (
    <div className="about-you">
      {/* ── Left Column ── */}
      <div className="about-you__left">
        <div className="about-you__header">
          <BrandLogo />
          <ProgressBar progress={progress} />
        </div>

        <div className="about-you__content">
          <h1 className="about-you__heading">About You</h1>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="about-you__fields">
              {/* Name */}
              <TextInput
                label="Name"
                placeholder="Jane Doe"
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              {/* Region section */}
              <div className="about-you__section">
                <h2 className="about-you__section-header">Region</h2>
                <hr className="about-you__divider" />
                <div className="about-you__section-fields">
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        label="Country"
                        options={COUNTRY_OPTIONS}
                        error={errors.country?.message}
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        label="State"
                        options={availableStates}
                        placeholder="Select a state"
                        error={errors.state?.message}
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Contact section */}
              <div className="about-you__section">
                <h2 className="about-you__section-header">Contact</h2>
                <hr className="about-you__divider" />
                <div className="about-you__section-fields">
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                      <Controller
                        name="phoneCountryCode"
                        control={control}
                        render={({ field: codeField }) => (
                          <PhoneInputField
                            label="Phone"
                            countryCode={codeField.value}
                            onCountryCodeChange={codeField.onChange}
                            phoneValue={field.value}
                            onPhoneChange={field.onChange}
                            error={errors.phoneNumber?.message}
                          />
                        )}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="about-you__buttons">
                <button
                  type="button"
                  className="about-you__btn about-you__btn--back"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="about-you__btn about-you__btn--next"
                >
                  Next
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── Right Column ── */}
      <div className="about-you__right">
        <span className="about-you__right-placeholder">Image</span>
      </div>
    </div>
  );
};

export default AboutYouStep;
