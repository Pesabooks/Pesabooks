import { Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Pool } from '../../types';

interface TotalPerCategoryProps {
  pool: Pool;
}

interface TotalPerCategoryType {
  name: string;
  deposit: number;
  withdrawal: number;
}

export const TotalPerCategory = ({ pool }: TotalPerCategoryProps) => {
  const [data, setData] = useState<TotalPerCategoryType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.rpc<TotalPerCategoryType>('get_total_per_category', {
        pool_id: pool.id,
      });
      setData(data ?? []);
    };
    fetchData();
  }, [pool]);

  return (
    <Table size="sm">
      <Thead>
        <Tr>
          <Th>Category</Th>
          <Th isNumeric>Deposit</Th>
          <Th isNumeric>Withdrawal</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((category, index) => (
          <Tr key={index}>
            <Td>{category.name}</Td>
            <Td isNumeric>
              {category.deposit > 0 && <Text color="green.400">{category.deposit}</Text>}
            </Td>
            <Td isNumeric>
              {category.withdrawal > 0 && <Text color="red.400">{category.withdrawal}</Text>}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
