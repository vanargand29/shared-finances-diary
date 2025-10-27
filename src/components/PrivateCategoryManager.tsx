import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

export interface PrivateCategory {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

interface PrivateCategoryManagerProps {
  userId: string;
  onCategoriesChange?: () => void;
}

export function PrivateCategoryManager({ userId, onCategoriesChange }: PrivateCategoryManagerProps) {
  const [categories, setCategories] = useState<PrivateCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [userId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('private_categories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Gagal memuat kategori');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('private_categories')
        .insert([{ name: newCategoryName.trim(), user_id: userId }]);

      if (error) {
        if (error.code === '23505') {
          toast.error('Kategori dengan nama ini sudah ada');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Kategori berhasil ditambahkan');
      setNewCategoryName('');
      setIsDialogOpen(false);
      await fetchCategories();
      onCategoriesChange?.();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Gagal menambahkan kategori');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    try {
      // Check if category is being used
      const { data: notesUsingCategory } = await supabase
        .from('financial_notes')
        .select('id')
        .eq('private_category_id', categoryId)
        .limit(1);

      if (notesUsingCategory && notesUsingCategory.length > 0) {
        toast.error('Kategori ini masih digunakan oleh catatan. Hapus atau pindahkan catatan terlebih dahulu.');
        return;
      }

      const { error } = await supabase
        .from('private_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast.success(`Kategori "${categoryName}" berhasil dihapus`);
      await fetchCategories();
      onCategoriesChange?.();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Gagal menghapus kategori');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Kategori Pribadi Saya</h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Nama Kategori</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Contoh: Jajan, Adek, Transportasi"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada kategori. Klik "Tambah Kategori" untuk membuat kategori baru.
          </p>
        ) : (
          categories.map((category) => (
            <Badge
              key={category.id}
              variant="secondary"
              className="gap-2 px-3 py-1.5 text-sm"
            >
              {category.name}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="hover:text-destructive transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus kategori "{category.name}"?
                      Kategori yang masih digunakan tidak dapat dihapus.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
