import React, { useState } from 'react';
import { FileNode } from '../types';
import { Folder, FileCode, ChevronRight, ChevronDown, Trash2, FolderPlus, FilePlus, X, Check } from 'lucide-react';

interface FileExplorerProps {
  files: FileNode[];
  activeFileId: string | null;
  onFileSelect: (id: string) => void;
  onCreateFile: (name: string, parentId: string) => void;
  onCreateFolder: (name: string, parentId: string) => void;
  onDelete: (id: string) => void;
  isDarkMode: boolean;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDelete,
  isDarkMode
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root', 'src']));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Creation State
  const [creationState, setCreationState] = useState<{isOpen: boolean, type: 'file' | 'folder', parentId: string} | null>(null);
  const [newItemName, setNewItemName] = useState('');

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getChildren = (parentId: string | null) => {
    return files.filter(f => f.parentId === parentId);
  };

  const startCreation = (type: 'file' | 'folder') => {
     let parentId = 'root';
     if (selectedId) {
        const selectedNode = files.find(f => f.id === selectedId);
        if (selectedNode?.type === 'folder') {
            parentId = selectedId;
        } else if (selectedNode?.parentId) {
            parentId = selectedNode.parentId;
        }
    } else {
        const srcFolder = files.find(f => f.name === 'src' && f.type === 'folder');
        if (srcFolder) parentId = srcFolder.id;
    }
    
    setCreationState({ isOpen: true, type, parentId });
    setNewItemName('');
    setExpandedFolders(prev => new Set(prev).add(parentId));
  };

  const submitCreation = () => {
      if (!creationState || !newItemName.trim()) return;
      
      const { type, parentId } = creationState;
      const finalName = type === 'file' && !newItemName.endsWith('.algo') ? `${newItemName}.algo` : newItemName;
      
      if (type === 'file') onCreateFile(finalName, parentId);
      else onCreateFolder(finalName, parentId);
      
      setCreationState(null);
  };

  const renderTree = (parentId: string | null, depth: number = 0) => {
    const children = getChildren(parentId);
    
    // If creating new item in this folder, show input field
    const isCreatingHere = creationState?.isOpen && creationState.parentId === parentId;

    return (
        <>
            {children.map(node => {
                const isExpanded = expandedFolders.has(node.id);
                const isActive = node.id === activeFileId;
                const isSelected = node.id === selectedId;

                return (
                    <div key={node.id}>
                    <div 
                        className={`
                        flex items-center gap-2 py-1.5 px-3 cursor-pointer text-sm select-none transition-colors border-l-2
                        ${isSelected 
                            ? (isDarkMode ? 'bg-emerald-900/40 border-emerald-500' : 'bg-emerald-50 border-emerald-600') 
                            : 'border-transparent ' + (isDarkMode ? 'hover:bg-emerald-900/20' : 'hover:bg-slate-100')}
                        ${isActive ? (isDarkMode ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold') : (isDarkMode ? 'text-slate-300' : 'text-slate-700')}
                        `}
                        style={{ paddingLeft: `${depth * 12 + 12}px` }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(node.id);
                            if (node.type === 'folder') toggleFolder(node.id);
                            else onFileSelect(node.id);
                        }}
                    >
                        {node.type === 'folder' ? (
                        <>
                            <span className="opacity-50">
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                            <Folder size={16} className={isDarkMode ? "text-amber-400" : "text-amber-500"} />
                        </>
                        ) : (
                        <FileCode size={16} className={isActive ? "text-red-500" : (isDarkMode ? "text-slate-400" : "text-slate-500")} />
                        )}
                        <span className="truncate">{node.name}</span>
                    </div>
                    
                    {node.type === 'folder' && isExpanded && (
                        <div className={`border-l ml-3 ${isDarkMode ? 'border-emerald-900/30' : 'border-slate-200'}`}>
                            {renderTree(node.id, depth + 1)}
                        </div>
                    )}
                    </div>
                );
            })}
            
            {/* Inline Creation Input */}
            {isCreatingHere && (
                 <div 
                    className={`flex items-center gap-2 py-1.5 px-2 text-sm ml-3 border-l ${isDarkMode ? 'border-emerald-900/30' : 'border-slate-200'}`}
                    style={{ paddingLeft: `${depth * 12 + 12}px` }}
                 >
                     {creationState.type === 'folder' ? 
                        <Folder size={16} className="text-amber-400" /> : 
                        <FileCode size={16} className="text-slate-400" />
                     }
                     <div className="flex items-center gap-1 flex-1">
                        <input 
                            autoFocus
                            type="text" 
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') submitCreation();
                                if (e.key === 'Escape') setCreationState(null);
                            }}
                            className={`w-full min-w-0 bg-transparent border rounded px-1 py-0.5 outline-none text-xs ${isDarkMode ? 'border-emerald-500 text-white' : 'border-blue-500 text-black'}`}
                            placeholder="Name..."
                        />
                        <button onClick={submitCreation} className="text-green-500 hover:text-green-400"><Check size={14}/></button>
                        <button onClick={() => setCreationState(null)} className="text-red-500 hover:text-red-400"><X size={14}/></button>
                     </div>
                 </div>
            )}
        </>
    );
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0a1f13]' : 'bg-slate-50'}`}>
      <div className={`flex items-center justify-between p-3 border-b ${isDarkMode ? 'border-emerald-900/30 bg-[#0f281a]' : 'border-slate-200 bg-white'}`}>
        <span className="text-xs font-bold uppercase tracking-wider opacity-70 text-emerald-600">Project</span>
        <div className="flex gap-1">
          <button 
            onClick={() => startCreation('file')} 
            className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-emerald-900/50 hover:text-emerald-400 text-slate-400' : 'hover:bg-emerald-100 hover:text-emerald-700 text-slate-500'}`} 
            title="New File"
          >
            <FilePlus size={16} />
          </button>
          <button 
            onClick={() => startCreation('folder')} 
            className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-emerald-900/50 hover:text-emerald-400 text-slate-400' : 'hover:bg-emerald-100 hover:text-emerald-700 text-slate-500'}`} 
            title="New Folder"
          >
            <FolderPlus size={16} />
          </button>
          <button 
            onClick={() => selectedId && selectedId !== 'root' && onDelete(selectedId)} 
            className="p-1.5 hover:bg-red-900/50 hover:text-red-500 text-slate-400 rounded disabled:opacity-30 transition-colors" 
            disabled={!selectedId || selectedId === 'root'}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {renderTree(null)}
      </div>
    </div>
  );
};