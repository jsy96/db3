// WebSocket 客户端配置
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws/products';

export interface WsMessage<T = unknown> {
	type: string;
	payload: T;
}

export interface Product {
	id: number;
	product_name: string;
	hs_code: string;
	created_at: string;
}

type MessageHandler = (msg: WsMessage) => void;

class ProductsWebSocket {
	private ws: WebSocket | null = null;
	private handlers: Set<MessageHandler> = new Set();
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 10;
	private reconnectDelay = 1000;
	private closed = false;

	connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.ws = new WebSocket(WS_URL);

				this.ws.onopen = () => {
					console.log('WebSocket 连接成功');
					this.reconnectAttempts = 0;
					resolve();
				};

				this.ws.onmessage = (event) => {
					try {
						const msg: WsMessage = JSON.parse(event.data);
						if (msg.type !== 'pong') {
							this.handlers.forEach((handler) => handler(msg));
						}
					} catch (err) {
						console.error('解析消息失败:', err);
					}
				};

				this.ws.onerror = (error) => {
					console.error('WebSocket 错误:', error);
				};

				this.ws.onclose = () => {
					console.log('WebSocket 连接关闭');
					if (!this.closed) {
						this.reconnect();
					}
				};
			} catch (err) {
				reject(err);
			}
		});
	}

	private reconnect() {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error('达到最大重连次数，停止重连');
			return;
		}

		this.reconnectAttempts++;
		const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
		console.log(`${delay}ms 后尝试第 ${this.reconnectAttempts} 次重连...`);

		setTimeout(() => {
			this.connect().catch(console.error);
		}, delay);
	}

	send(msg: WsMessage) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(msg));
		} else {
			console.warn('WebSocket 未连接，消息未发送');
		}
	}

	onMessage(handler: MessageHandler) {
		this.handlers.add(handler);
		return () => this.handlers.delete(handler);
	}

	close() {
		this.closed = true;
		this.ws?.close();
	}

	isConnected(): boolean {
		return this.ws?.readyState === WebSocket.OPEN;
	}

	// 获取产品列表
	listProducts(keyword?: string) {
		this.send({ type: 'products:list', payload: { keyword } });
	}

	// 创建产品
	createProduct(product_name: string, hs_code: string) {
		this.send({ type: 'products:create', payload: { product_name, hs_code } });
	}

	// 更新产品
	updateProduct(id: number, product_name: string, hs_code: string) {
		this.send({ type: 'products:update', payload: { id, product_name, hs_code } });
	}

	// 删除产品
	deleteProduct(id: number) {
		this.send({ type: 'products:delete', payload: { id } });
	}
}

// 单例
export const productsWs = new ProductsWebSocket();
