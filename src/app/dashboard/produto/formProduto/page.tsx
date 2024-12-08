import { useState, useEffect } from 'react';
import { createClient } from '../../../../../utils/supabase/client';
import { insertProduct, updateProduct } from '../actions';
import { listCategories } from '../../categoria/actions';
import { v4 as uuidv4 } from 'uuid'; // Importando a função para gerar UUID

type Product = {
    id: number;
    uuid: string;
    name: string;
    info: string;
    price: number;
    image_url: string;
    category_id: number;
    created_at?: string;
    updated_at?: string;
};

type Category = {
    id: number;
    category_name: string;
};

type ProductFormProps = {
    onProductAdded: (product: Product) => void;
    onProductUpdated: (product: Product) => void;
    editingProduct: Product | null;
    setEditingProduct: (product: Product | null) => void;
    onClose: () => void;
};

const ProductForm = ({ onProductAdded, onProductUpdated, editingProduct, setEditingProduct, onClose }: ProductFormProps) => {
    const [productName, setProductName] = useState('');
    const [productInfo, setProductInfo] = useState('');
    const [productPrice, setProductPrice] = useState(0);
    const [productImageUrl, setProductImageUrl] = useState('');
    const [productCategoryId, setProductCategoryId] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchCategories = async () => {
            const { categories, error } = await listCategories(supabase);
            if (error) {
                setError('Erro ao listar categorias: ' + error.message);
            } else {
                setCategories(categories);
            }
        };

        fetchCategories();

        if (editingProduct) {
            setProductName(editingProduct.name);
            setProductInfo(editingProduct.info);
            setProductPrice(editingProduct.price);
            setProductImageUrl(editingProduct.image_url);
            setProductCategoryId(editingProduct.category_id);
            setImagePreviewUrl(editingProduct.image_url); // Exibe a imagem existente
        } else {
            setProductName('');
            setProductInfo('');
            setProductPrice(0);
            setProductImageUrl('');
            setProductCategoryId(null);
            setImagePreviewUrl(null);
        }
    }, [supabase, editingProduct]);

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const uniqueFileName = `${uuidv4()}-${file.name}`; // Gerando um nome único para o arquivo

            const { data, error } = await supabase.storage
                .from('images') // Certifique-se de substituir 'images' pelo nome correto do seu bucket no Supabase
                .upload(`${uniqueFileName}`, file);

            if (error) {
                setError('Erro ao fazer upload da imagem: ' + error.message);
            } else if (data) {
                const { data: publicData } = supabase.storage.from('images').getPublicUrl(data.path);
                const imageUrl = publicData.publicUrl;
                setProductImageUrl(imageUrl);
                setImagePreviewUrl(imageUrl);
            }
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const productData = {
                name: productName,
                info: productInfo,
                price: productPrice,
                image_url: productImageUrl, // Salva a URL da imagem obtida do Supabase
                category_id: productCategoryId!,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            if (editingProduct) {
                const { product, error } = await updateProduct(supabase, editingProduct.id!, productData);
                if (error) {
                    setError('Erro ao atualizar produto: ' + error.message);
                    setSuccess(null);
                } else if (product) {
                    setSuccess('Produto atualizado com sucesso: ' + product.name);
                    setError(null);
                    onProductUpdated(product);
                    setEditingProduct(null);
                }
            } else {
                const { product, error } = await insertProduct(supabase, productData);
                if (error) {
                    setError('Erro ao inserir produto: ' + error.message);
                    setSuccess(null);
                } else if (product) {
                    setSuccess('Produto inserido com sucesso: ' + product.name);
                    setError(null);
                    onProductAdded(product);
                }
            }

            // Limpa os campos após a submissão
            setProductName('');
            setProductInfo('');
            setProductPrice(0);
            setProductImageUrl('');
            setProductCategoryId(null);
            setImagePreviewUrl(null);
        } catch (error) {
            console.error('Erro ao processar formulário de produto:', error);
            setError('Erro ao processar formulário de produto.');
        }
    };

    return (
        <>
            <h2>{editingProduct ? 'Atualizar' : 'Adicionar'} Produto</h2>
            <form onSubmit={handleSubmit} className='modal_form'>
                <label htmlFor="productName">Nome do Produto</label>
                <input
                    type="text"
                    name="name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Nome do Produto"
                    required
                />

                <label htmlFor="productInfo">Informações do Produto</label>
                <textarea
                    name="info"
                    value={productInfo}
                    onChange={(e) => setProductInfo(e.target.value)}
                    placeholder="Informações do Produto"
                    required
                />

                <label htmlFor="productPrice">Preço</label>
                <input
                    type="number"
                    name="price"
                    value={productPrice}
                    onChange={(e) => setProductPrice(parseFloat(e.target.value))}
                    placeholder="Preço"
                    required
                />

                <label htmlFor="productImage">Imagem do Produto</label>
                <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                />
                {imagePreviewUrl && <img src={imagePreviewUrl} alt="Preview da Imagem" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />}

                <label htmlFor="selectCategory">Selecione a categoria</label>
                <select
                    name="category_id"
                    value={productCategoryId || ''}
                    onChange={(e) => setProductCategoryId(parseInt(e.target.value))}
                    required
                >
                    <option value="" disabled>Selecione a Categoria</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.category_name}</option>
                    ))}
                </select>
                <div className='btn_container_modal'>
                    <button type="button" onClick={onClose}>Cancelar</button>
                    <button type="submit">{editingProduct ? 'Atualizar' : 'Adicionar'}</button>
                </div>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </>
    );
};

export default ProductForm;
