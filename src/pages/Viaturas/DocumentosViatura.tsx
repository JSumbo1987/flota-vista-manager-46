// src/pages/viaturas/DocumentosViatura.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Plus, FolderArchive, Trash, ChevronLeft } from "lucide-react";
import { usePermissao } from "@/hooks/usePermissao";

const DocumentosViatura = () => {
  const { viaturaId } = useParams(); // viaturaid
  const navigate = useNavigate();
  const { toast } = useToast();
  const { temPermissao } = usePermissao();  
  const [viatura, setViatura] = useState<any>(null);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);

  useEffect(() => {
    const fetchViatura = async () => {
      const { data, error } = await supabase.from("tblviaturas")
        .select(`*, tblviaturacategoria(viaturacategoria)`)
        .eq("viaturaid", viaturaId)
        .single();

      if (error) {
        toast({ title: "Erro ao carregar viatura", description: error.message, variant: "destructive" });
      } else {
        setViatura(data);
      }
    };
    fetchViatura();
    fetchDocumentos();
  }, [viaturaId, toast]);

  const fetchDocumentos = async () => {
    const { data, error } = await supabase.from("tbldocumentosviatura")
      .select("*")
      .eq("viaturaid", viaturaId);

    if (!error) setDocumentos(data);
  };

  const handleUpload = async () => {
    if (!tipoDocumento || !arquivo) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    const filePath = `doc-viaturas/${viatura.viaturamatricula}/${Date.now()}_${arquivo.name}`;
    const { error: uploadError } = await supabase.storage
      .from("documentos")
      .upload(filePath, arquivo);

    if (uploadError) {
      toast({ title: "Erro ao enviar arquivo", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { error: insertError } = await supabase.from("tbldocumentosviatura").insert({
      viaturaid: viaturaId,
      tipodocumento: tipoDocumento,
      documento: filePath,
    });

    if (!insertError) {
      toast({ title: "Documento adicionado com sucesso" });
      setModalOpen(false);
      setTipoDocumento("");
      setArquivo(null);
      fetchDocumentos();
    }
  };

  const handleDeleteClick = (documento) => {
    setDocumentoSelecionado(documento);
    setShowDeleteDialog(true);
  };

  const handleDeleteDocumento = async () => {  
    if (!documentoSelecionado) return;
    
    try {
      // 1. Exclui o arquivo do Supabase Storage
      const { error: storageError } = await supabase.storage
        .from("documentos") // substitua pelo nome real do seu bucket
        .remove([documentoSelecionado.documento]);
  
      if (storageError) throw storageError;
  
      // 2. Exclui o registro do banco de dados
      const { error: dbError } = await supabase
        .from("tbldocumentosviatura")
        .delete()
        .eq("id", documentoSelecionado.id);
  
      if (dbError) throw dbError;

      toast({
        title: "Documento excluído",
        description: `O documento foi excluída com sucesso.`,
      });
  
      // 3. Atualiza o estado local
      setDocumentos((prev) => prev.filter((doc) => doc.id !== documentoSelecionado.id));
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      toast({ title:"Erro ao Excluir", description: "Erro ao excluir o documento da viatura, verifique a console.", variant: "destructive" });
    }finally{
      setShowDeleteDialog(false);
      setDocumentoSelecionado(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Documentos da Viatura</h2>
          <p className="text-muted-foreground">Gerencie os documentos obrigatórios da viatura</p>
        </div>
        <div className="flex gap-2">
        <Button variant="ghost" onClick={() => navigate("/viaturas")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
        </Button>
          {temPermissao("viaturas","caninsert") && (<Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Inserir Documento
        </Button>)}
        </div>
      </div>

      {viatura && (
        <Card>
          <CardHeader>
            <CardTitle>{viatura.viaturamarca} {viatura.viaturamodelo} - {viatura.viaturamatricula}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><b>Categoria:</b> {viatura.tblviaturacategoria?.viaturacategoria}</div>
            <div><b>Ano:</b> {viatura.viaturaanofabrica}</div>
            <div><b>Cor:</b> {viatura.viaturacor}</div>
            <div><b>Combustível:</b> {viatura.viaturacombustivel}</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Documentos Carregados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Arquivo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.tipodocumento}</TableCell>
                  <TableCell>
                    <a href={`https://<your-bucket-url>/storage/v1/object/public/viaturas/${doc.documento}`}
                      target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Visualizar</a>
                  </TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(doc)} >
                      <Trash/>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {documentos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2}>Nenhum documento adicionado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserir Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Título de Propriedade">Título de Propriedade</SelectItem>
                <SelectItem value="Livrete">Livrete</SelectItem>
                <SelectItem value="Guia Provisória">Guia Provisória</SelectItem>
              </SelectContent>
            </Select>
            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setArquivo(e.target.files?.[0] || null)} />
            <Button onClick={handleUpload}>
              <FolderArchive className="mr-2 h-4 w-4" /> Enviar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Deseja realmente excluir esta documento? Esta ação é irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteDocumento}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentosViatura;
