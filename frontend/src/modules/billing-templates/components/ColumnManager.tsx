import React, { useState, useRef } from 'react';
import { X, GripVertical, Package, Warehouse, Receipt, Plus } from 'lucide-react';
import { Switch } from '../../../components/ui/switch';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import type { InvoiceColumn, InvoiceTemplate } from '../../../types/invoice';
import { cn } from '../../../lib/utils';

const sectionConfig = {
  product: { label: 'Product', icon: Package, colorClass: 'text-invoice-product' },
  inventory: { label: 'Inventory', icon: Warehouse, colorClass: 'text-invoice-inventory' },
  taxation: { label: 'Taxation', icon: Receipt, colorClass: 'text-invoice-taxation' },
} as const;

interface ColumnManagerProps {
  template: InvoiceTemplate;
  onClose: () => void;
  onSave: (columns: InvoiceColumn[]) => void;
}

export function ColumnManager({ template, onClose, onSave }: ColumnManagerProps) {
  const [columns, setColumns] = useState<InvoiceColumn[]>([...template.columns]);
  const [addingSection, setAddingSection] = useState<'product' | 'inventory' | 'taxation' | null>(null);
  const [newColumnLabel, setNewColumnLabel] = useState('');
  const dragItem = useRef<{ id: string; section: string } | null>(null);
  const dragOverItem = useRef<{ id: string; section: string } | null>(null);

  const toggle = (id: string) => {
    setColumns(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const sectionColumns = (section: 'product' | 'inventory' | 'taxation') =>
    columns.filter(c => c.section === section);

  const handleDragStart = (id: string, section: string) => {
    dragItem.current = { id, section };
  };

  const handleDragOver = (e: React.DragEvent, id: string, section: string) => {
    e.preventDefault();
    dragOverItem.current = { id, section };
  };

  const handleDrop = (e: React.DragEvent, section: string) => {
    e.preventDefault();
    if (!dragItem.current || !dragOverItem.current) return;
    if (dragItem.current.section !== section || dragOverItem.current.section !== section) return;

    const sectionCols = columns.filter(c => c.section === section);
    const otherCols = columns.filter(c => c.section !== section);
    
    const dragIdx = sectionCols.findIndex(c => c.id === dragItem.current!.id);
    const overIdx = sectionCols.findIndex(c => c.id === dragOverItem.current!.id);
    
    if (dragIdx === -1 || overIdx === -1) return;

    const reordered = [...sectionCols];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(overIdx, 0, moved);

    // Rebuild columns preserving order of other sections
    const newColumns: InvoiceColumn[] = [];
    const sections: Array<'product' | 'inventory' | 'taxation'> = ['product', 'inventory', 'taxation'];
    for (const s of sections) {
      if (s === section) {
        newColumns.push(...reordered);
      } else {
        newColumns.push(...columns.filter(c => c.section === s));
      }
    }
    setColumns(newColumns);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const addCustomColumn = (section: 'product' | 'inventory' | 'taxation') => {
    if (!newColumnLabel.trim()) return;
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setColumns(prev => [...prev, { id, label: newColumnLabel.trim(), section, enabled: true }]);
    setNewColumnLabel('');
    setAddingSection(null);
  };

  const removeColumn = (id: string) => {
    setColumns(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card rounded-xl border invoice-shadow-lg w-full max-w-lg mx-4 max-h-[85vh] flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="font-semibold text-card-foreground">Manage Columns</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{template.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <Tabs defaultValue="product" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mx-5 mt-4 w-fit">
            {(['product', 'inventory', 'taxation'] as const).map(section => {
              const cfg = sectionConfig[section];
              const Icon = cfg.icon;
              return (
                <TabsTrigger key={section} value={section} className="gap-1.5 text-xs">
                  <Icon className={cn('h-3.5 w-3.5', cfg.colorClass)} />
                  {cfg.label}
                  <span className="ml-1 text-muted-foreground">
                    ({sectionColumns(section).filter(c => c.enabled).length}/{sectionColumns(section).length})
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(['product', 'inventory', 'taxation'] as const).map(section => (
            <TabsContent key={section} value={section} className="flex-1 overflow-auto px-5 pb-4">
              <p className="text-[11px] text-muted-foreground mt-2 mb-2">Drag to reorder • Toggle to show/hide</p>
              <div className="space-y-1">
                {sectionColumns(section).map(col => (
                  <div
                    key={col.id}
                    draggable
                    onDragStart={() => handleDragStart(col.id, section)}
                    onDragOver={(e) => handleDragOver(e, col.id, section)}
                    onDrop={(e) => handleDrop(e, section)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors cursor-grab active:cursor-grabbing',
                      col.enabled ? 'bg-card border-border' : 'bg-muted/50 border-transparent'
                    )}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    <span className={cn('flex-1 text-sm', col.enabled ? 'text-card-foreground' : 'text-muted-foreground')}>
                      {col.label}
                    </span>
                    {col.id.startsWith('custom_') && (
                      <button
                        onClick={() => removeColumn(col.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <Switch checked={col.enabled} onCheckedChange={() => toggle(col.id)} />
                  </div>
                ))}
                {sectionColumns(section).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No {section} columns in this template
                  </p>
                )}
              </div>

              {/* Add custom column */}
              {addingSection === section ? (
                <div className="flex gap-2 mt-3">
                  <Input
                    placeholder="Column name..."
                    className="text-sm h-9"
                    value={newColumnLabel}
                    onChange={e => setNewColumnLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomColumn(section)}
                    autoFocus
                  />
                  <Button size="sm" className="h-9" onClick={() => addCustomColumn(section)}>Add</Button>
                  <Button size="sm" variant="outline" className="h-9" onClick={() => { setAddingSection(null); setNewColumnLabel(''); }}>Cancel</Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5 text-xs w-full"
                  onClick={() => setAddingSection(section)}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Custom Column
                </Button>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex gap-3 p-5 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => { onSave(columns); onClose(); }}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
