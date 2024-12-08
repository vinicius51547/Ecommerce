'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../utils/supabase/client';
import { insertSetting, updateSetting, fetchSetting } from '../actions';
import styles from './style.module.scss';

type Settings = {
    id: number;
    title: string;
    subtitle: string;
    address: string;
    header_url: string;
    phone_number: string;
    company_logo: string;
    created_at?: string;
    updated_at?: string;
};

type NewSettings = Omit<Settings, 'id'>;

type SettingsFormProps = {
    onSettingAdded: (setting: Settings) => void;
    onSettingUpdated: (setting: Settings) => void;
    editingSetting: Settings | null;
    setEditingSetting: (setting: Settings | null) => void;
};

const SettingsForm = ({ onSettingAdded, onSettingUpdated, editingSetting, setEditingSetting }: SettingsFormProps) => {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [address, setAddress] = useState('');
    const [headerUrl, setHeaderUrl] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [companyLogo, setCompanyLogo] = useState(''); // Adiciona o state para o logo
    const [image, setImage] = useState<File | null>(null);
    const [logoImage, setLogoImage] = useState<File | null>(null); // Adiciona o state para a imagem do logo
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null); // Adiciona o state para a pré-visualização do logo
    const supabase = createClient();

    useEffect(() => {
        const loadSettings = async () => {
            const { data, error } = await fetchSetting(supabase);
            if (data) {
                setTitle(data.title);
                setSubtitle(data.subtitle);
                setAddress(data.address);
                setHeaderUrl(data.header_url);
                setPhoneNumber(data.phone_number);
                setCompanyLogo(data.company_logo); // Define o logo da companhia
                setEditingSetting(data);
                setImagePreviewUrl(data.header_url); // Define a URL da imagem para o preview
                setLogoPreviewUrl(data.company_logo); // Define a URL da logo para o preview
            }
            if (error) {
                console.error('Erro ao buscar configuração:', error.message);
            }
        };

        loadSettings();
    }, [supabase, setEditingSetting]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);
            setImagePreviewUrl(URL.createObjectURL(event.target.files[0])); // Cria uma URL para o preview da imagem
        }
    };

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setLogoImage(event.target.files[0]);
            setLogoPreviewUrl(URL.createObjectURL(event.target.files[0])); // Cria uma URL para o preview da logo
        }
    };

    const uploadImage = async (imageFile: File): Promise<string | null> => {
        // Upload da imagem para o Supabase
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('images') // Nome do bucket
            .upload(`${Date.now()}_${imageFile.name}`, imageFile);

        if (uploadError) {
            console.error('Erro ao fazer upload da imagem:', uploadError.message);
            return null;
        }

        // Obtenção da URL pública
        const { data: publicUrlData } = supabase.storage
            .from('images')
            .getPublicUrl(uploadData.path);

        return publicUrlData.publicUrl || null;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            let headerUrlToUse = headerUrl;
            let companyLogoToUse = companyLogo;

            if (image) {
                const imageUrl = await uploadImage(image);
                if (imageUrl) {
                    headerUrlToUse = imageUrl;
                }
            }

            if (logoImage) {
                const logoUrl = await uploadImage(logoImage);
                if (logoUrl) {
                    companyLogoToUse = logoUrl;
                }
            }

            const settingData: NewSettings = {
                title,
                subtitle,
                address,
                company_logo: companyLogoToUse, // Salva a URL da logo
                header_url: headerUrlToUse, // Salva a URL da imagem de header
                phone_number: phoneNumber,
            };

            if (editingSetting) {
                const { setting, error } = await updateSetting(supabase, editingSetting.id, settingData);
                if (error) {
                    setError('Erro ao atualizar configuração: ' + error.message);
                    setSuccess(null);
                } else if (setting) {
                    setSuccess('Configuração atualizada com sucesso: ' + setting.title);
                    setError(null);
                    onSettingUpdated(setting);
                    setEditingSetting(setting);
                }
            } else {
                const { setting, error } = await insertSetting(supabase, settingData);
                if (error) {
                    setError('Erro ao inserir configuração: ' + error.message);
                    setSuccess(null);
                } else if (setting) {
                    setSuccess('Configuração inserida com sucesso: ' + setting.title);
                    setError(null);
                    onSettingAdded(setting);
                    setEditingSetting(setting);
                }
            }
        } catch (error) {
            console.error('Erro ao processar formulário de configuração:', error);
            setError('Erro ao processar formulário de configuração.');
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className={styles.formContainer}>


                    {/* Escolher imagem de cabeçalho */}
                    <label htmlFor="file-upload" className={styles.file_upload}>
                        {imagePreviewUrl &&
                            <img src={imagePreviewUrl}
                                alt="Imagem Preview"
                                className={styles.img_preview} />
                        }
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        name="image"
                        onChange={handleImageChange}
                        accept="image/*"
                        style={{ display: "none" }}
                    />


                    {/* Escolher Logo */}
                    <label htmlFor="logo-upload" className={styles.logo_upload} >
                        {logoPreviewUrl &&
                            <img src={logoPreviewUrl}
                                alt="Logo Preview"
                                className={styles.logo_upload}
                            />
                        }
                    </label>
                    <input
                        id="logo-upload"
                        type="file"
                        name="company_logo"
                        onChange={handleLogoChange}
                        accept="image/*"
                        style={{ display: "none" }}
                    />

                    <span>Nome do estabelecimento:</span>
                    <input
                        type="text"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nome do estabelecimento:"
                        required
                        className={styles.formInput}
                    />

                    <span>Titulo do estabelecimento:</span>
                    <input
                        type="text"
                        name="subtitle"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="Titulo do estabelecimento"
                        required
                        className={styles.formInput}
                    />

                    <span>Endereço do estabelecimento:</span>
                    <input
                        type="text"
                        name="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Endereço"
                        required
                        className={styles.formInput}
                    />

                    <span>Número do estabelecimento:</span>
                    <input
                        type="text"
                        name="phone_number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Número de Telefone"
                        required
                        className={styles.formInput}
                    />

                    <button className={styles.btn_submit} type="submit" title='salver' >Salvar</button>
                </div>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </>
    );
};

export default SettingsForm;
