'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import TextInput from '@/components/onboarding/TextInput';
import SelectField from '@/components/onboarding/SelectField';
import PhoneInputField from '@/components/onboarding/PhoneInputField';
import { useBuyerOnboardingStore } from '@/store/useBuyerOnboardingStore';

/* ------------------------------------------------------------------ */
/*  Static Data                                                        */
/* ------------------------------------------------------------------ */

const COUNTRIES = [
  { value: 'United States', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'India', label: 'India' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Mexico', label: 'Mexico' },
  { value: 'Japan', label: 'Japan' },
];

type SelectOption = { value: string; label: string };

const STATES_BY_COUNTRY: Record<string, SelectOption[]> = {
  'United States': [
    'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
    'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
    'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
    'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
    'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
    'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
    'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
    'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
  ].map((s) => ({ value: s, label: s })),

  'Canada': [
    'Alberta','British Columbia','Manitoba','New Brunswick',
    'Newfoundland and Labrador','Nova Scotia','Ontario',
    'Prince Edward Island','Quebec','Saskatchewan',
    'Northwest Territories','Nunavut','Yukon',
  ].map((s) => ({ value: s, label: s })),

  'United Kingdom': [
    'England','Scotland','Wales','Northern Ireland',
  ].map((s) => ({ value: s, label: s })),

  'Australia': [
    'New South Wales','Victoria','Queensland','South Australia',
    'Western Australia','Tasmania','Australian Capital Territory',
    'Northern Territory',
  ].map((s) => ({ value: s, label: s })),

  'Germany': [
    'Baden-Württemberg','Bavaria','Berlin','Brandenburg','Bremen',
    'Hamburg','Hesse','Lower Saxony','Mecklenburg-Vorpommern',
    'North Rhine-Westphalia','Rhineland-Palatinate','Saarland',
    'Saxony','Saxony-Anhalt','Schleswig-Holstein','Thuringia',
  ].map((s) => ({ value: s, label: s })),

  'France': [
    'Île-de-France','Provence-Alpes-Côte d\'Azur','Auvergne-Rhône-Alpes',
    'Occitanie','Nouvelle-Aquitaine','Hauts-de-France','Grand Est',
    'Bretagne','Normandie','Pays de la Loire','Bourgogne-Franche-Comté',
    'Centre-Val de Loire','Corse',
  ].map((s) => ({ value: s, label: s })),

  'India': [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
    'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
    'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
    'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
    'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
    'Delhi','Jammu and Kashmir',
  ].map((s) => ({ value: s, label: s })),

  'Brazil': [
    'São Paulo','Rio de Janeiro','Minas Gerais','Bahia','Paraná',
    'Rio Grande do Sul','Pernambuco','Ceará','Pará','Santa Catarina',
    'Goiás','Maranhão','Amazonas','Mato Grosso','Distrito Federal',
  ].map((s) => ({ value: s, label: s })),

  'Mexico': [
    'Aguascalientes','Baja California','Baja California Sur','Campeche',
    'Chiapas','Chihuahua','Ciudad de México','Coahuila','Colima',
    'Durango','Guanajuato','Guerrero','Hidalgo','Jalisco','México',
    'Michoacán','Morelos','Nayarit','Nuevo León','Oaxaca','Puebla',
    'Querétaro','Quintana Roo','San Luis Potosí','Sinaloa','Sonora',
    'Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas',
  ].map((s) => ({ value: s, label: s })),

  'Japan': [
    'Hokkaido','Aomori','Tokyo','Osaka','Kyoto','Fukuoka',
    'Kanagawa','Saitama','Chiba','Hyogo','Aichi','Okinawa',
  ].map((s) => ({ value: s, label: s })),
};

/* ------------------------------------------------------------------ */
/*  Validation Schema                                                  */
/* ------------------------------------------------------------------ */

const aboutYouSchema = yup.object().shape({
  fullName: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  country: yup.string().required('Country is required'),
  state: yup.string().required('State is required'),
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(
      /^\d{3}-?\d{3}-?\d{4}$/,
      'Enter a valid 10-digit phone number (e.g. 000-000-0000)'
    ),
});

type AboutYouFormData = yup.InferType<typeof aboutYouSchema>;

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function AboutYouPage() {
  const router = useRouter();
  const { aboutYou, setAboutYou, nextStep } = useBuyerOnboardingStore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AboutYouFormData>({
    resolver: yupResolver(aboutYouSchema),
    defaultValues: {
      fullName: aboutYou.fullName,
      country: aboutYou.country,
      state: aboutYou.state,
      phoneNumber: aboutYou.phoneNumber,
    },
  });

  const selectedCountry = watch('country');
  const stateOptions = STATES_BY_COUNTRY[selectedCountry] ?? [];

  /* Reset state when country changes (skip on initial mount) */
  const countryRef = React.useRef(aboutYou.country);
  useEffect(() => {
    if (countryRef.current !== selectedCountry) {
      setValue('state', '');
      countryRef.current = selectedCountry;
    }
  }, [selectedCountry, setValue]);

  const onSubmit = (data: AboutYouFormData) => {
    // Persist to Zustand store
    setAboutYou({
      fullName: data.fullName,
      country: data.country,
      state: data.state,
      phoneNumber: data.phoneNumber,
      phoneCountryCode: aboutYou.phoneCountryCode,
    });

    // Log staged payload for eventual POST /buyers endpoint
    console.log('✅ About You — staged payload:', {
      ...data,
      phoneCountryCode: aboutYou.phoneCountryCode,
    });

    nextStep();
  };

  const handleBack = () => {
    router.push('/role-selection');
  };

  const handleCountryCodeChange = (value: string) => {
    setAboutYou({ phoneCountryCode: value });
  };

  return (
    <OnboardingLayout progress={10}>
      <h1 className="onboarding-heading">About You</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="onboarding-fields" noValidate>
        {/* Name Field */}
        <TextInput
          label="Name"
          placeholder="Placeholder text"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        {/* Region Section */}
        <div className="onboarding-section">
          <h2 className="onboarding-section__header">Region</h2>
          <div className="onboarding-section__divider" />

          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Country"
                options={COUNTRIES}
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
                options={stateOptions}
                placeholder="Select a state"
                error={errors.state?.message}
                disabled={stateOptions.length === 0}
                {...field}
              />
            )}
          />
        </div>

        {/* Contact Section */}
        <div className="onboarding-section">
          <h2 className="onboarding-section__header">Contact</h2>
          <div className="onboarding-section__divider" />

          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <PhoneInputField
                label="Phone"
                countryCodeValue={aboutYou.phoneCountryCode}
                onCountryCodeChange={handleCountryCodeChange}
                error={errors.phoneNumber?.message}
                placeholder="000-000-0000"
                {...field}
              />
            )}
          />
        </div>

        {/* Bottom Action Buttons */}
        <div className="onboarding-buttons">
          <button
            type="button"
            className="onboarding-btn onboarding-btn--back"
            onClick={handleBack}
          >
            Back
          </button>
          <button type="submit" className="onboarding-btn onboarding-btn--next">
            Next
          </button>
        </div>
      </form>
    </OnboardingLayout>
  );
}
