import { FormControl, FormLabel, Textarea, FormErrorMessage, BoxProps } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

export const TextAreaMemoField = (boxProps: BoxProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <FormControl {...boxProps} isInvalid={errors.memo}>
      <FormLabel htmlFor="memo">Memo</FormLabel>
      <Textarea id="memo" {...register('memo')} />
      <FormErrorMessage>{errors.memo}</FormErrorMessage>
    </FormControl>
  );
};
