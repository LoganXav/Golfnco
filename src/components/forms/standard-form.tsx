'use client';
import * as React from 'react';
import { PersonalInfo, StandardMembershipInfo } from './steps';
import { EmergencyContactInfo } from './steps';
import StepperButton from '../stepper-button';
import useStepper from '@/hooks/use-stepper';
import { Button } from '../ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { type FormDTO, FormDataSchema, FieldName } from '@/lib/schema';
// import { addMemberAction } from '@/app/_actions/member';
import { Icons } from '../icons';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function StandardForm() {
  const stepper = useStepper();
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  const form = useForm<FormDTO>({
    defaultValues: {
      category: 'standard',
      // Personal Info
      firstName: 'Ayomikun',
      lastName: 'Balogun',
      phoneNumber: '09052916792',
      email: 'example@email.com',
      dateOfBirth: new Date('2006-02-16'),
      gender: 'Female',
      occupation: 'Engineer',
      nin: '26738491561',
      zip: 33052,
      province: 'Lagos Island',
      address: '3353, International Village court',

      // Membership Info
      index: 14,
      handicap: 34,
      standardMerchandise: 'A pair of branded Golf wear',
      standardService: 'Access to Free Parking',
      golfDays: [
        { label: 'Weekdays 12-4pm', value: 'Weekdays 12-4pm' },
        {
          label: 'Fridays-Sundays 12-4pm',
          value: 'Fridays-Sundays 12-4pm',
        },
        { label: 'Sundays only 12-7pm', value: 'Sundays only 12-7pm' },
      ],

      // Emergency Contact Info
      contactName: 'Segun',
      relationship: 'Friend',
      contactNumber: '09052916792',
      contactEmail: 'contact@example.com',
    },
    resolver: zodResolver(FormDataSchema),
  });

  const control = form.control;
  const trigger = form.trigger;
  const errors = form.formState.errors;
  const handleSubmit = form.handleSubmit;

  const processForm: SubmitHandler<FormDTO> = (data) => {
    startTransition(async () => {
      console.info('@Request', data);
      // const response = await addMemberAction(data);
      const response = { message: 'Member added successfully', type: null };
      if (response.type !== 'Error') {
        toast.success(response.message);
        console.info('@Response_data', response);
        router.push('/directory');
      } else {
        toast.error(response.message);
        console.error('@Response_error', response);
      }
    });
  };

  const stepProps = {
    control,
    errors,
  };

  const steps = [
    {
      label: 'Personal Details',
      content: <PersonalInfo {...stepProps} />,
      fields: [
        'firstName',
        'lastName',
        'phoneNumber',
        'email',
        'dateOfBirth',
        'gender',
        'occupation',
        'nin',
        'zip',
        'province',
        'address',
      ],
    },
    {
      label: 'Membership Details',
      content: <StandardMembershipInfo {...stepProps} />,
      fields: [
        'index',
        'handicap',
        'preferences',
        'premiumServices',
        'golfDays',
      ],
    },
    {
      label: 'Emergency Contact',
      content: <EmergencyContactInfo {...stepProps} />,
      fields: ['contactName', 'relationship', 'contactNo', 'contactEmail'],
    },
  ];
  const isFirstStep = stepper.step === 0;
  const isLastStep = stepper.step === steps.length - 1;

  const [stepCompleted, setStepCompleted] = React.useState(
    Array(steps.length).fill(false)
  );

  const next = async () => {
    const fields = steps?.[stepper.step]?.fields;

    const output = await trigger(fields as FieldName[], { shouldFocus: true });
    if (!output) return;

    if (isLastStep) {
      await handleSubmit(processForm)();
    } else {
      stepper.next(undefined);
      const currentStepIndex = stepper.step;
      setStepCompleted((prev) => {
        const updatedSteps = [...prev];
        updatedSteps[currentStepIndex] = true;
        return updatedSteps;
      });
    }
  };

  const previous = () => {
    if (!isFirstStep) {
      stepper.previous(undefined);
    }
  };

  return (
    <>
      <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start">
        <div className="grid place-items-center gap-4">
          {steps.map((step, i) => (
            <div key={i}>
              <StepperButton
                stepper={stepper}
                completed={stepCompleted[i]}
                selected={stepper.step === i}
                step={i + 1}
                i={i}
              >
                {step.label}
              </StepperButton>
            </div>
          ))}
        </div>
        <div className="flex-1" />
        <form className="lg:w-3/4">
          {steps?.[stepper.step]?.content}
          <div className="mt-16 flex justify-center gap-4">
            <Button
              type="button"
              variant="destructive"
              disabled={isPending || isFirstStep}
              onClick={previous}
            >
              Previous
            </Button>
            <Button disabled={isPending} type="button" onClick={next}>
              {isPending && (
                <Icons.spinner
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {isLastStep ? 'Submit' : 'Next'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
