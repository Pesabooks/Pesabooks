import { Button, Flex, Text, useDisclosure } from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardHeader } from '../../../components/Card';
import { ConfirmationModal, ConfirmationRef } from '../../../components/Modals/ConfirmationModal';
import { usePool } from '../../../hooks/usePool';
import {
  activateCategory,
  addCategory,
  editCategory,
  getAllCategories
} from '../../../services/categoriesService';
import { Category } from '../../../types';
import { CategoriesTable } from '../components/CategoriesTable';
import { CategoryModal } from '../components/CategoryModal';

export const CategoriesPage = () => {
  const { pool } = usePool();
  const [categories, setCategories] = useState<Category[]>([]);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [isSaving, setIsSaving] = useState(false);

  const getCategories = useCallback(() => {
    if (pool) getAllCategories(pool?.id).then(setCategories);
  }, [pool]);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const confirmationRef = useRef<ConfirmationRef>(null);



  const confirmDeactivation = useCallback((categoryId: number) => {
    confirmationRef.current?.open('Are you sure you want to deactivate?', categoryId);
  }, []);

  const onActivate = useCallback(
    async (categoryId: number) => {
      await activateCategory(categoryId, true);
      await getCategories();
    },
    [getCategories],
  );

  const onEditCategory = useCallback(
    (category: Category) => {
      setSelectedCategory(category);
      onOpen();
    },
    [onOpen],
  );

  function onAddCategory() {
    setSelectedCategory(undefined);
    onOpen();
  }

  const addorEditCategory = async (category: Category) => {
    try {
      setIsSaving(true);
      if (category.id) await editCategory(category.id, category);
      else if (pool) await addCategory(pool.id, category);
      onClose();
      await getCategories();
    } finally {
      setIsSaving(false);
    }
  };

  const onDeactivate = async (confirmed: boolean, data: unknown) => {
    const categoryId = data as number;
    if (confirmed) {
      await activateCategory(categoryId, false);
      await getCategories();
    }
  };

  return (
    <>
      <Card>
        <CardHeader mb="40px">
          <Flex justify="space-between" align="center" w="100%">
            <Text fontSize="lg" fontWeight="bold">
              Categories
            </Text>
            <Button size="sm" onClick={onAddCategory}>
              Add Category
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <CategoriesTable
            categories={categories}
            onEdit={onEditCategory}
            onActivate={onActivate}
            onDeactivate={confirmDeactivation}
          ></CategoriesTable>
        </CardBody>
      </Card>
      {isOpen && (
        <CategoryModal
          isOpen={isOpen}
          onClose={onClose}
          isSaving={isSaving}
          onSave={addorEditCategory}
          category={selectedCategory}
        />
      )}
      <ConfirmationModal ref={confirmationRef} afterClosed={onDeactivate} />
    </>
  );
};
