import { NextResponse } from "next/server";
import path from "path";
import db from "@/lib/db"
import { writeFile } from "fs/promises";
import fs from "fs";


// Definindo o diretório de uploads dentro de 'public/uploads' para acesso público
const uploadDir = path.join(process.cwd(), "public", "uploads", "tarefas"); // Agora é dentro de 'public'

export const POST = async (req: any) => {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name.replaceAll(" ", "_");

  // Criação do diretório, caso não exista
  try {
    await fs.promises.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create upload directory:", error);
    return NextResponse.json({ error: "Failed to create upload directory" }, { status: 500 });
  }

  try {
    // Salvar o arquivo dentro de 'public/uploads/tarefas'
    const filePath = path.join(uploadDir, filename);
    console.log("Saving file to:", filePath);  // Verifique o caminho completo

    await writeFile(filePath, buffer);

    // Agora o arquivo é acessível publicamente através da URL /uploads/tarefas/{filename}
    const fileUrl = `/uploads/tarefas/${filename}`;

    // Aqui você irá salvar o caminho do arquivo no banco de dados para associá-lo à tarefa
    const taskId = req.url.split("/")[5];  // Supondo que o ID da tarefa esteja na URL

    await db.execute(
      `INSERT INTO anexos (task_id, file_name, file_url) VALUES (?, ?, ?)`,
      [taskId, filename, fileUrl]
    );

    console.log("File saved successfully:", fileUrl);  // Verifique se o arquivo foi salvo corretamente
    return NextResponse.json({ message: "Success", status: 201, fileUrl: fileUrl });
  } catch (error) {
    console.error("Error occurred while saving the file:", error);
    return NextResponse.json({ message: "Failed", status: 500 });
  }
};


// Função para buscar anexos de uma tarefa
export async function GET(req: any, { params }: { params: { id: string } }) {
    const taskId = params.id;
  
    try {
      // Consulta os anexos associados à tarefa
      const [result]: any = await db.query("SELECT * FROM anexos WHERE task_id = ?", [taskId]);
  
      if (!result || result.length === 0) {
        return NextResponse.json({ success: false, message: "Nenhum anexo encontrado para essa tarefa." }, { status: 404 });
      }
  
      // Retorna os anexos encontrados com o file_url
      return NextResponse.json({ success: true, anexos: result });
    } catch (error) {
      console.error("Erro ao buscar anexos:", error);
      return NextResponse.json({ success: false, message: "Erro interno ao buscar anexos." }, { status: 500 });
    }
  }
  