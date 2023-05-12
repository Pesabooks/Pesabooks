import { Card, CardBody, CardHeader, Flex, Text, useDisclosure } from '@chakra-ui/react';
import { ButtonWithAdmingRights } from '@pesabooks/components/withConnectedWallet';
import { usePool } from '@pesabooks/hooks';
import { addCategory, editCategory, getAllCategories } from '@pesabooks/services/categoriesService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Category } from '../../../types';
import { CategoriesTable } from '../components/CategoriesTable';
import { CategoryModal } from '../components/CategoryModal';

export const CategoriesPage = () => {
  const { pool } = usePool();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  if (!pool) throw new Error('Pool is not set');

  const cacheKey = [pool.id, 'categories'];

  const { data: categories } = useQuery({
    queryKey: cacheKey,
    queryFn: () => getAllCategories(pool.id),
    enabled: !!pool.id,
  });

  const onEditCategory = useCallback(async (categoryId: number, category: Partial<Category>) => {
    await editCategory(categoryId, category);
  }, []);

  const onAddCategory = async (category: Category) => {
    try {
      setIsSaving(true);
      if (pool) await addCategory(pool.id, category);
      onClose();
      queryClient.invalidateQueries(cacheKey);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center" w="100%">
            <Text fontSize="lg" fontWeight="bold">
              Categories
            </Text>
            <ButtonWithAdmingRights size="sm" onClick={onOpen}>
              Add Category
            </ButtonWithAdmingRights>
          </Flex>
        </CardHeader>
        <CardBody>
          <CategoriesTable categories={categories ?? []} onEdit={onEditCategory}></CategoriesTable>
        </CardBody>
      </Card>
      {isOpen && (
        <CategoryModal
          isOpen={isOpen}
          onClose={onClose}
          isSaving={isSaving}
          onSave={onAddCategory}
        />
      )}
    </>
  );
};
