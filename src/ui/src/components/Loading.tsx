import { Center, Spinner, SpinnerProps } from '@chakra-ui/react';

interface LoadingProps extends SpinnerProps {
  fullHeight?: boolean;
}
function Loading({ fullHeight, ...centerProps }: LoadingProps) {
  return (
    <Center h={fullHeight ? '100vh' : '100%'} >
      <Spinner thickness="4px" speed="0.65s" size="xl" {...centerProps} />
    </Center>
  );
}

export default Loading;
