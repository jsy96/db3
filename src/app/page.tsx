'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { productsWs, type Product } from '@/lib/ws-client';

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [connected, setConnected] = useState(false);

	// 编辑状态
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [editForm, setEditForm] = useState({ product_name: '', hs_code: '' });
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	// 新增状态
	const [addForm, setAddForm] = useState({ product_name: '', hs_code: '' });
	const [addDialogOpen, setAddDialogOpen] = useState(false);

	// 删除状态
	const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

	// 搜索状态
	const [searchKeyword, setSearchKeyword] = useState('');

	// WebSocket 消息处理
	useEffect(() => {
		// 连接 WebSocket
		productsWs.connect().then(() => {
			setConnected(true);
			productsWs.listProducts();
		}).catch(() => {
			setError('无法连接到服务器');
			setLoading(false);
		});

		// 监听消息
		const unsubscribe = productsWs.onMessage((msg) => {
			switch (msg.type) {
				case 'products:list:result':
					setProducts(msg.payload as Product[]);
					setLoading(false);
					setError(null);
					break;
				case 'products:create:result':
					productsWs.listProducts(searchKeyword);
					setAddForm({ product_name: '', hs_code: '' });
					setAddDialogOpen(false);
					break;
				case 'products:update:result':
					productsWs.listProducts(searchKeyword);
					setEditDialogOpen(false);
					setEditingProduct(null);
					break;
				case 'products:delete:result':
					productsWs.listProducts(searchKeyword);
					setDeleteConfirmId(null);
					break;
				case 'products:create:error':
				case 'products:update:error':
				case 'products:delete:error':
					setError((msg.payload as { error: string }).error);
					setLoading(false);
					break;
			}
		});

		return () => {
			unsubscribe();
			productsWs.close();
		};
	}, []);

	// 搜索
	const handleSearch = useCallback((keyword: string) => {
		setSearchKeyword(keyword);
		productsWs.listProducts(keyword);
	}, []);

	// 新增产品
	const handleAdd = () => {
		if (!addForm.product_name.trim() || !addForm.hs_code.trim()) return;
		productsWs.createProduct(addForm.product_name.trim(), addForm.hs_code.trim());
	};

	// 打开编辑弹窗
	const handleEditOpen = (product: Product) => {
		setEditingProduct(product);
		setEditForm({ product_name: product.product_name, hs_code: product.hs_code });
		setEditDialogOpen(true);
	};

	// 保存编辑
	const handleSave = () => {
		if (!editingProduct || !editForm.product_name.trim() || !editForm.hs_code.trim()) return;
		productsWs.updateProduct(editingProduct.id, editForm.product_name.trim(), editForm.hs_code.trim());
	};

	// 删除确认
	const handleDelete = () => {
		if (deleteConfirmId === null) return;
		productsWs.deleteProduct(deleteConfirmId);
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* 顶部导航 */}
			<header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
				<div className="max-w-6xl mx-auto px-4 py-4">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
							产品 HS 编码管理
						</h1>
						<div className="flex items-center gap-2">
							<span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
							<span className="text-sm text-gray-500">{connected ? '已连接' : '未连接'}</span>
							<Button onClick={() => setAddDialogOpen(true)} className="gap-2 ml-2">
								<Plus className="w-4 h-4" />
								新增产品
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* 主内容 */}
			<main className="max-w-6xl mx-auto px-4 py-6">
				{/* 搜索栏 */}
				<div className="mb-6 relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
					<Input
						type="text"
						placeholder="搜索产品名称或 HS 编码..."
						value={searchKeyword}
						onChange={(e) => handleSearch(e.target.value)}
						className="pl-10 bg-white dark:bg-gray-800"
					/>
				</div>

				{/* 错误提示 */}
				{error && (
					<div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
						{error}
					</div>
				)}

				{/* 数据表格 */}
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
					{loading ? (
						<div className="p-8 text-center text-gray-500 dark:text-gray-400">
							加载中...
						</div>
					) : products.length === 0 ? (
						<div className="p-8 text-center text-gray-500 dark:text-gray-400">
							{searchKeyword ? '未找到匹配的产品' : '暂无产品数据，点击上方按钮添加'}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-16">ID</TableHead>
									<TableHead>英文品名</TableHead>
									<TableHead className="w-40">HS 编码</TableHead>
									<TableHead className="w-40">操作</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{products.map((product) => (
									<TableRow key={product.id}>
										<TableCell className="text-gray-500 dark:text-gray-400">
											{product.id}
										</TableCell>
										<TableCell className="font-medium text-gray-900 dark:text-white">
											{product.product_name}
										</TableCell>
										<TableCell>
											<span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-mono">
												{product.hs_code}
											</span>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEditOpen(product)}
													className="gap-1"
												>
													<Pencil className="w-3 h-3" />
													编辑
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setDeleteConfirmId(product.id)}
													className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
												>
													<Trash2 className="w-3 h-3" />
													删除
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>

				{/* 数据统计 */}
				<div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
					共 {products.length} 条记录
				</div>
			</main>

			{/* 新增弹窗 */}
			<Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>新增产品</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
								英文品名
							</label>
							<Input
								value={addForm.product_name}
								onChange={(e) => setAddForm({ ...addForm, product_name: e.target.value })}
								placeholder="输入产品英文名称"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
								HS 编码
							</label>
							<Input
								value={addForm.hs_code}
								onChange={(e) => setAddForm({ ...addForm, hs_code: e.target.value })}
								placeholder="输入 HS 编码"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setAddDialogOpen(false)}>
							取消
						</Button>
						<Button onClick={handleAdd} disabled={!addForm.product_name.trim() || !addForm.hs_code.trim()}>
							添加
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* 编辑弹窗 */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>编辑产品</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
								英文品名
							</label>
							<Input
								value={editForm.product_name}
								onChange={(e) => setEditForm({ ...editForm, product_name: e.target.value })}
								placeholder="输入产品英文名称"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
								HS 编码
							</label>
							<Input
								value={editForm.hs_code}
								onChange={(e) => setEditForm({ ...editForm, hs_code: e.target.value })}
								placeholder="输入 HS 编码"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditDialogOpen(false)}>
							取消
						</Button>
						<Button onClick={handleSave} disabled={!editForm.product_name.trim() || !editForm.hs_code.trim()}>
							保存
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* 删除确认弹窗 */}
			<AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>确认删除</AlertDialogTitle>
					</AlertDialogHeader>
					<p className="text-gray-600 dark:text-gray-400 py-4">
						确定要删除这条产品记录吗？此操作无法撤销。
					</p>
					<AlertDialogFooter>
						<Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
							取消
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							删除
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
