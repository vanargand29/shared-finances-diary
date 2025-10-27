import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FinanceNote } from '@/pages/Dashboard';

interface FinanceNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  editingNote: FinanceNote | null;
  userId: string;
}

export function FinanceNoteDialog({
  open,
  onClose,
  onSave,
  editingNote,
  userId,
}: FinanceNoteDialogProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setAmount(editingNote.amount.toString());
      setType(editingNote.type);
      setDescription(editingNote.description || '');
      setIsPrivate(editingNote.is_private);
    } else {
      resetForm();
    }
  }, [editingNote, open]);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setType('income');
    setDescription('');
    setIsPrivate(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const noteData = {
        title,
        amount: parseFloat(amount),
        type,
        description: description || null,
        is_private: isPrivate,
        user_id: userId,
      };

      if (editingNote) {
        const { error } = await supabase
          .from('financial_notes')
          .update(noteData)
          .eq('id', editingNote.id);

        if (error) throw error;
        toast.success('Catatan berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('financial_notes')
          .insert([noteData]);

        if (error) throw error;
        toast.success('Catatan berhasil ditambahkan');
      }

      onSave();
      resetForm();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Gagal menyimpan catatan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingNote ? 'Edit Catatan' : 'Tambah Catatan Baru'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Gaji Bulanan"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipe</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as 'income' | 'expense')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="font-normal cursor-pointer">
                  Pemasukan
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="font-normal cursor-pointer">
                  Pengeluaran
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan catatan detail..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="private">Catatan Pribadi</Label>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
            >
              {isLoading ? 'Menyimpan...' : editingNote ? 'Perbarui' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
