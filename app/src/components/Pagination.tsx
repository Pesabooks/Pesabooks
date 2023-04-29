import {
  Button,
  Flex,
  Icon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
} from '@chakra-ui/react';
import { GrFormNext, GrFormPrevious } from 'react-icons/gr';

export interface PaginationProps {
  pageSize: number;
  pageIndex: number;
  total: number;
  onChangePage: (page: number) => void;
}
export const Pagination = ({ pageIndex, pageSize, total, onChangePage }: PaginationProps) => {
  const previousPage = () => onChangePage(pageIndex - 1);
  const nextPage = () => onChangePage(pageIndex + 1);
  const gotoPage = (page: number) => onChangePage(page);

  const createPages = (count: number) => {
    let arrPageCount = [];

    for (let i = 1; i <= count; i++) {
      arrPageCount.push(i);
    }

    return arrPageCount;
  };

  const pageCount = total / pageSize;
  const canPreviousPage = pageIndex > 0;

  const canNextPage = pageIndex < pageCount - 1;

  return (
    <Flex
      direction={{ sm: 'column', md: 'row' }}
      w="100%"
      justify="space-between"
      align="center"
      px={{ md: '22px' }}
    >
      <Text fontSize="sm" color="gray.500" fontWeight="normal" mb={{ sm: '24px', md: '0px' }}>
        Showing {pageSize * pageIndex + 1} to{' '}
        {pageSize * (pageIndex + 1) <= total ? pageSize * (pageIndex + 1) : total} of {total}{' '}
        entries
      </Text>
      <Stack direction="row" alignSelf="flex-end" spacing="4px" ms="auto">
        <Button
          variant="no-hover"
          onClick={() => previousPage()}
          transition="all .5s ease"
          w="40px"
          h="40px"
          borderRadius="50%"
          bg="#fff"
          border="1px solid lightgray"
          display={pageSize === 5 ? 'none' : canPreviousPage ? 'flex' : 'none'}
          _hover={{
            bg: 'gray.200',
            opacity: '0.7',
            borderColor: 'gray.500',
          }}
        >
          <Icon as={GrFormPrevious} w="16px" h="16px" color="gray.400" />
        </Button>
        {pageSize === 5 ? (
          <NumberInput
            max={pageCount - 1}
            min={1}
            w="75px"
            mx="6px"
            defaultValue="1"
            onChange={(e) => gotoPage(+e)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper onClick={() => nextPage()} />
              <NumberDecrementStepper onClick={() => previousPage()} />
            </NumberInputStepper>
          </NumberInput>
        ) : (
          createPages(pageCount).map((pageNumber, index) => {
            return (
              <Button
                variant="no-hover"
                transition="all .5s ease"
                onClick={() => gotoPage(pageNumber - 1)}
                w="40px"
                h="40px"
                borderRadius="160px"
                bg={pageNumber === pageIndex + 1 ? 'teal.300' : '#fff'}
                border="1px solid lightgray"
                _hover={{
                  bg: 'gray.200',
                  opacity: '0.7',
                  borderColor: 'gray.500',
                }}
                key={index}
              >
                <Text fontSize="sm" color={pageNumber === pageIndex + 1 ? '#fff' : 'gray.600'}>
                  {pageNumber}
                </Text>
              </Button>
            );
          })
        )}
        <Button
          variant="no-hover"
          onClick={() => nextPage()}
          transition="all .5s ease"
          w="40px"
          h="40px"
          borderRadius="160px"
          bg="#fff"
          border="1px solid lightgray"
          display={pageSize === 5 ? 'none' : canNextPage ? 'flex' : 'none'}
          _hover={{
            bg: 'gray.200',
            opacity: '0.7',
            borderColor: 'gray.500',
          }}
        >
          <Icon as={GrFormNext} w="16px" h="16px" color="gray.400" />
        </Button>
      </Stack>
    </Flex>
  );
};
