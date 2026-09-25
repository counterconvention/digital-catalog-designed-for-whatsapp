import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  exportProductsToCsv,
  exportOrdersToCsv,
  parseProductsCsv
} from '../../utils/csv';
import { Product } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Upload,
  HardDrive,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const AdminCsv: React.FC = () => {
  const { products, orders, importProductsList } = useStore();
  const [csvInput, setCsvInput] = useState('');
  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [replaceMode, setReplaceMode] = useState(false);

  // File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvInput(content);
        handlePreview(content);
      }
    };
    reader.readAsText(file);
  };

  const handlePreview = (text: string) => {
    const { products: parsed, errors } = parseProductsCsv(text);
    setPreviewProducts(parsed);
    setImportErrors(errors);
  };

  const handleConfirmImport = () => {
    if (previewProducts.length === 0) return;
    importProductsList(previewProducts, replaceMode);
    setFeedback(`Sucesso! ${previewProducts.length} produtos foram importados com sucesso.`);
    setCsvInput('');
    setPreviewProducts([]);
    setTimeout(() => setFeedback(''), 5000);
  };

  const handleOpenGoogleDriveSheets = () => {
    // Open Google Sheets new spreadsheet
    window.open('https://sheets.new', '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid: Export & Google Drive Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Exportação Local de CSV */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-neutral-900 text-base">
                Exportar CSV Localmente
              </h3>
              <p className="text-xs text-neutral-500">
                Baixe planilhas compatíveis com Excel, Numbers e Google Sheets.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-neutral-900 text-xs">
                  Catálogo de Produtos ({products.length} itens)
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Inclui preços de venda, preços de custo, estoque por tamanho e fotos.
                </p>
              </div>
              <button
                onClick={() => exportProductsToCsv(products)}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-neutral-900 text-xs">
                  Histórico de Pedidos ({orders.length} vendas)
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Inclui clientes, totais, margens de lucro, itens e forma de pagamento.
                </p>
              </div>
              <button
                onClick={() => exportOrdersToCsv(orders)}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Integração com Google Drive & Google Sheets */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-neutral-900 text-base">
                  Google Drive & Google Sheets
                </h3>
                <p className="text-xs text-neutral-500">
                  Sincronização e edição em nuvem de planilhas de catálogo.
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Você pode editar seus produtos no Google Drive e importar o arquivo gerado aqui com um clique. Nosso sistema aceita arquivos exportados do Google Sheets em formato CSV (separado por vírgulas ou ponto-e-vírgula).
            </p>

            <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs text-emerald-900 space-y-1">
              <span className="font-bold block">Como usar com o Google Drive:</span>
              <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-emerald-800">
                <li>Exporte o catálogo atual pelo botão ao lado.</li>
                <li>Abra o Google Drive, clique em <em>Novo &gt; Upload de arquivos</em>.</li>
                <li>Edite seus preços ou estoque e salve como CSV para reimportar.</li>
              </ol>
            </div>
          </div>

          <button
            onClick={handleOpenGoogleDriveSheets}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir Nova Planilha no Google Sheets (Drive)</span>
          </button>
        </div>
      </div>

      {/* 3. Seção de Importação de CSV */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-neutral-900 text-base">
                Importar Produtos via CSV
              </h3>
              <p className="text-xs text-neutral-500">
                Selecione o arquivo .csv ou cole o conteúdo da planilha diretamente abaixo.
              </p>
            </div>
          </div>
        </div>

        {/* Upload File or Paste */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">
              Arquivo .CSV do seu Computador / Google Drive
            </label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="w-full text-xs text-neutral-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-800 hover:file:bg-neutral-200 border border-neutral-300 rounded-2xl p-2 bg-neutral-50/50"
            />
          </div>

          <div className="flex items-center justify-start sm:justify-end gap-3 pt-4 sm:pt-0">
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={replaceMode}
                onChange={(e) => setReplaceMode(e.target.checked)}
                className="rounded-sm text-rose-600 focus:ring-rose-500"
              />
              <span>Substituir todo o catálogo existente</span>
            </label>
          </div>
        </div>

        {/* Textarea for pasting raw CSV */}
        <div>
          <label className="text-xs font-bold text-neutral-700 block mb-1">
            Ou cole o texto da sua planilha CSV aqui:
          </label>
          <textarea
            rows={4}
            placeholder={`Nome;Categoria;Preço Venda;Preço Fabricação;Tamanhos;Cores\nVestido Seda;Vestidos;269.00;95.00;P:5|M:8|G:4;Esmeralda|Champagne`}
            value={csvInput}
            onChange={(e) => {
              setCsvInput(e.target.value);
              handlePreview(e.target.value);
            }}
            className="w-full px-3 py-2 text-xs font-mono rounded-2xl border border-neutral-300 focus:ring-2 focus:ring-rose-500/20 bg-neutral-50/50"
          />
        </div>

        {/* Error alerts */}
        {importErrors.length > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Avisos na validação do CSV:
            </span>
            {importErrors.map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        )}

        {/* Preview Table before committing */}
        {previewProducts.length > 0 && (
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-neutral-900 text-xs">
                Pré-visualização da Importação ({previewProducts.length} itens identificados)
              </h4>
              <button
                onClick={handleConfirmImport}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Confirmar Importação de {previewProducts.length} Produtos
              </button>
            </div>

            <div className="border border-neutral-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Nome</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3">Preço Venda</th>
                    <th className="py-2.5 px-3">Preço Custo</th>
                    <th className="py-2.5 px-3">Grade Tamanhos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {previewProducts.map((p, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-neutral-900">{p.name}</td>
                      <td className="py-2 px-3 text-neutral-600">{p.category}</td>
                      <td className="py-2 px-3 font-bold text-neutral-900">
                        R$ {p.salePrice.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-2 px-3 text-neutral-500">
                        R$ {p.costPrice.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-2 px-3 text-neutral-700">
                        {p.sizes.map((s) => `${s.size}:${s.quantity}`).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
