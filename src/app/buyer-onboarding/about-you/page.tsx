'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import SelectField from '@/components/onboarding/SelectField';
import { useBuyerOnboardingStore } from '@/store/useBuyerOnboardingStore';

const STATES = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
].map((state) => ({
  value: state,
  label: state,
}));

const aboutYouSchema = yup.object({
  state: yup.string().required('State is required'),
});

type AboutYouFormData = yup.InferType<typeof aboutYouSchema>;

export default function AboutYouPage() {
  const router = useRouter();
  const { aboutYou, setAboutYou } =
    useBuyerOnboardingStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AboutYouFormData>({
    resolver: yupResolver(aboutYouSchema),
    defaultValues: {
      state: aboutYou.state,
    },
  });

  const onSubmit = (data: AboutYouFormData) => {
    setAboutYou({
      state: data.state,
    });

    router.push("/buyer-dashboard");
  };

  const handleBack = () => {
    router.push('/role-selection');
  };

  return (
    <OnboardingLayout progress={10}>
      <h1 className="onboarding-heading">About You</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="onboarding-fields"
        noValidate
      >
        <div className="onboarding-section">
          <h2 className="onboarding-section__header">
            Region
          </h2>

          <div className="onboarding-section__divider" />

          <div>
            <SelectField
              label="State"
              options={STATES}
              placeholder="Select a state"
              error={errors.state?.message}
              {...register('state')}
            />
          </div>
        </div>

        <div className="onboarding-buttons">
          <button
            type="button"
            className="onboarding-btn onboarding-btn--back"
            onClick={handleBack}
          >
            Back
          </button>

          <button
            type="submit"
            className="onboarding-btn onboarding-btn--next"
          >
            Next
          </button>
        </div>
      </form>
    </OnboardingLayout>
  );
}