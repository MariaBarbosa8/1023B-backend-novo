import {Router} from 'express'

import carrinhoController from './carrinho/carrinho.controller.js'
import produtosController from './produtos/produtos.controller.js'

const rotas = Router()

// Rotas do Carrinho
rotas.get('/carrinho/:usuarioId', carrinhoController.listar)
rotas.post('/carrinho', carrinhoController.adicionarItem)
rotas.put('/carrinho', carrinhoController.atualizarQuantidade)
rotas.delete('/carrinho/:usuarioId/item/:produtoId', carrinhoController.removerItem)
rotas.delete('/carrinho/:usuarioId', carrinhoController.remover)


// Rotas dos produtos
rotas.get('/produtos',produtosController.listar)
rotas.post('/produtos',produtosController.adicionar)


export default rotas