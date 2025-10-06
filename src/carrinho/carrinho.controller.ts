import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { db } from "../database/banco-mongo.js";

interface ItemCarrinho {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  nome: string;
}

interface Carrinho {
  usuarioId: string;
  itens: ItemCarrinho[];
  dataAtualizacao: Date;
  total: number;
}

const carrinhos: Carrinho[] = [];

class CarrinhoController {
  async adicionarItem(req: Request, res: Response) {
    const { usuarioId, produtoId, quantidade } = req.body;

    if (!usuarioId || !produtoId || !quantidade || quantidade < 1) {
      return res.status(400).json({ error: "Dados incompletos ou inválidos." });
    }

    // Buscar o produto no banco de dados
    const produto = await db.collection("produtos").findOne({ _id: new ObjectId.createFromHexString(produtoId) });
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }
    const precoUnitario = produto.preco;
    const nome = produto.nome;
  

    // Verificar se um carrinho com o usuário já existe
    let carrinho = carrinhos.find(c => c.usuarioId === usuarioId);

    // Se não existir, criar novo carrinho
    if (!carrinho) {
      carrinho = { usuarioId, itens: [], dataAtualizacao: new Date(), total: 0 };
      carrinhos.push(carrinho);
    }

    // Se existir, adicionar ou atualizar item
    const itemExistente = carrinho.itens.find(item => item.produtoId === produtoId);
    if (itemExistente) {
      itemExistente.quantidade += quantidade;
    } else {
      carrinho.itens.push({
        produtoId,
        quantidade,
        precoUnitario,
        nome,
      });
    }

    // Calcular total do carrinho
    carrinho.total = carrinho.itens.reduce((sum, item) => sum + item.quantidade * item.precoUnitario, 0);
    carrinho.dataAtualizacao = new Date();

    return res.json({ message: "Item adicionado com sucesso!", carrinho });
  }

  async removerItem(req: Request, res: Response) {
    const { usuarioId, produtoId } = req.params;
    if (!usuarioId || !produtoId) return res.status(400).json({ error: "Informe usuário e produto." });

    const carrinho = carrinhos.find(c => c.usuarioId === usuarioId);
    if (!carrinho) return res.status(404).json({ error: "Carrinho não encontrado." });

    carrinho.itens = carrinho.itens.filter(item => item.produtoId !== produtoId);
    carrinho.total = carrinho.itens.reduce((sum, item) => sum + item.quantidade * item.precoUnitario, 0);
    carrinho.dataAtualizacao = new Date();

    return res.json({ message: "Item removido do carrinho.", carrinho });
  }

  async atualizarQuantidade(req: Request, res: Response) {
    const { usuarioId, produtoId, quantidade } = req.body;
    if (!usuarioId || !produtoId || quantidade < 1) {
      return res.status(400).json({ error: "Informe usuário, produto e quantidade válida." });
    }

    const carrinho = carrinhos.find(c => c.usuarioId === usuarioId);
    if (!carrinho) return res.status(404).json({ error: "Carrinho não encontrado." });

    const item = carrinho.itens.find(i => i.produtoId === produtoId);
    if (!item) return res.status(404).json({ error: "Produto não encontrado no carrinho." });

    item.quantidade = quantidade;
    carrinho.total = carrinho.itens.reduce((sum, i) => sum + i.quantidade * i.precoUnitario, 0);
    carrinho.dataAtualizacao = new Date();

    return res.json({ message: "Quantidade atualizada.", carrinho });
  }

  async listar(req: Request, res: Response) {
    const { usuarioId } = req.params;
    if (!usuarioId) return res.status(400).json({ error: "Informe o usuário." });

    const carrinho = carrinhos.find(c => c.usuarioId === usuarioId);
    if (!carrinho) return res.status(404).json({ error: "Carrinho não encontrado." });

    return res.json(carrinho);
  }

  async remover(req: Request, res: Response) {
    const { usuarioId } = req.params;
    if (!usuarioId) return res.status(400).json({ error: "Informe o usuário." });

    const index = carrinhos.findIndex(c => c.usuarioId === usuarioId);
    if (index === -1) return res.status(404).json({ error: "Carrinho não encontrado." });

    carrinhos.splice(index, 1);
    return res.json({ message: "Carrinho removido com sucesso." });
  }
}

export default new CarrinhoController();
