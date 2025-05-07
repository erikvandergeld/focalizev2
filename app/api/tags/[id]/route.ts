import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db"; // Usando o pool de conexões
import { verifyToken } from "@/lib/auth-middleware";

// Função para garantir a execução segura das consultas
async function safeQuery(query: string, values: any[] = []): Promise<any> {
  const connection = await db.getConnection();  // Obtém uma conexão do pool
  try {
    const [rows] = await connection.execute(query, values);  // Executa a consulta
    return rows;
  } finally {
    connection.release();  // Libera a conexão para o pool
  }
}

// Função PUT para atualizar uma tag
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  let decoded: any;
  try {
    decoded = verifyToken(req);  // Verifica o token
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 });  // Token inválido
  }

  const { id } = params;
  const { name, color } = await req.json();

  if (!name || !color) {
    return NextResponse.json({ success: false, message: "Nome e cor são obrigatórios." }, { status: 400 });
  }

  try {
    // Usando safeQuery para garantir que a conexão seja fechada
    await safeQuery("UPDATE tags SET name = ?, color = ? WHERE id = ?", [name, color, id]);

    return NextResponse.json({
      success: true,
      tag: {
        id,
        name,
        color,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar tag:", error);
    return NextResponse.json({ success: false, message: "Erro ao atualizar a tag." }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // Verifica o token e decodifica
  let decoded: any;
  try {
    decoded = verifyToken(req);  // Verifica o token
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 });  // Token inválido
  }

  const { id } = params;  // Esse já é o valor do `params` passado diretamente pela rota

  if (!id) {
    return NextResponse.json({ success: false, message: "ID não fornecido." }, { status: 400 });
  }

  try {
    // // Verifica se algum cliente está usando essa tag
    // const [clientsUsingTag]: any = await db.query(
    //   "SELECT id FROM clients WHERE JSON_CONTAINS(tags, JSON_QUOTE(?))",
    //   [id]  // Aqui você está tentando verificar se a tag está associada ao cliente
    // );

    // if (clientsUsingTag.length > 0) {
    //   return NextResponse.json({
    //     success: false,
    //     message: "Não é possível excluir uma tag vinculada a um ou mais clientes.",
    //   }, { status: 400 });
    // }

    // Excluir a tag
    const [result]: any = await db.query("DELETE FROM tags WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Tag não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Tag excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir tag:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}