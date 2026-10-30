"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, Check, ChevronDown, ChevronLeft, CirclePlus, ImagePlus, LoaderCircle, LogOut, Package, Pencil, Settings2, Star, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { formatMoney } from "@/lib/money";

type Category = { id: string; slug: string; name: string; emoji: string; sortOrder: number };
type Product = { id: string; slug: string; name: string; description: string; priceCents: number; imageUrl: string; available: boolean; featured: boolean; categoryId: string; category: Category };
type StoreSettings = { storeName: string; whatsappNumber: string; monthlyPromotion: string; acceptedPayments: string[] };
type ProductDraft = { slug: string; name: string; description: string; price: string; imageUrl: string; categoryId: string; available: boolean; featured: boolean };
type CategoryDraft = { slug: string; name: string; emoji: string; sortOrder: string };
type AdminData = { categories: Category[]; products: Product[]; settings: StoreSettings | null };
type Tab = "products" | "categories" | "store";

const emptyProduct: ProductDraft = { slug: "", name: "", description: "", price: "", imageUrl: "", categoryId: "", available: true, featured: false };
const emptyCategory: CategoryDraft = { slug: "", name: "", emoji: "🍰", sortOrder: "0" };
const defaultSettings: StoreSettings = { storeName: "Amareli", whatsappNumber: "5582991140378", monthlyPromotion: "Quem mais comprar este mês ganha um prêmio especial!", acceptedPayments: ["Pix", "Dinheiro", "Cartão"] };

export function AdminDashboard({ user, initialData }: { user: { name: string; email: string; image?: string | null }; initialData: AdminData }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("products");
  const [data, setData] = useState<AdminData>(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [productDraft, setProductDraft] = useState<ProductDraft>(emptyProduct);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(emptyCategory);
  const [settingsDraft, setSettingsDraft] = useState<StoreSettings>(defaultSettings);

  async function loadData() {
    try {
      const response = await fetch("/api/admin/settings", { cache: "no-store" });
      const result = await response.json() as AdminData & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível carregar os dados.");
      setError("");
      setData(result);
      setSettingsDraft(result.settings ?? defaultSettings);
      setProductDraft((draft) => draft.categoryId || !result.categories[0] ? draft : { ...draft, categoryId: result.categories[0].id });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar o painel.");
    }
  }

  const visibleProducts = useMemo(() => data.products.filter((product) => `${product.name} ${product.category.name} ${product.slug}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))), [data.products, search]);

  function startNewProduct() {
    setProductId(null);
    setProductDraft({ ...emptyProduct, categoryId: data.categories[0]?.id ?? "" });
    setError(""); setNotice("");
    setTab("products");
    document.getElementById("admin-product-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startEditProduct(product: Product) {
    setProductId(product.id);
    setProductDraft({ slug: product.slug, name: product.name, description: product.description, price: centsToInput(product.priceCents), imageUrl: product.imageUrl, categoryId: product.categoryId, available: product.available, featured: product.featured });
    setError(""); setNotice("");
    document.getElementById("admin-product-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    const priceCents = parsePrice(productDraft.price);
    if (priceCents === null) { setSaving(false); setError("Informe um preço válido com até duas casas decimais."); return; }
    try {
      const response = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
        method: productId ? "PATCH" : "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...productDraft, priceCents }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível salvar o produto.");
      setNotice(productId ? "Produto atualizado." : "Produto cadastrado.");
      setProductId(null); setProductDraft({ ...emptyProduct, categoryId: data.categories[0]?.id ?? "" });
      await loadData();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar o produto."); }
    finally { setSaving(false); }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Remover “${product.name}” do catálogo?`)) return;
    setError(""); setNotice("");
    const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error ?? "Não foi possível remover o produto."); return; }
    setNotice("Produto removido do catálogo."); await loadData();
  }

  function startEditCategory(category: Category) {
    setCategoryId(category.id);
    setCategoryDraft({ slug: category.slug, name: category.name, emoji: category.emoji, sortOrder: String(category.sortOrder) });
  }

  async function saveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(categoryId ? `/api/admin/categories/${categoryId}` : "/api/admin/categories", {
        method: categoryId ? "PATCH" : "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...categoryDraft, sortOrder: Number(categoryDraft.sortOrder) }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível salvar a categoria.");
      setNotice(categoryId ? "Categoria atualizada." : "Categoria criada."); setCategoryId(null); setCategoryDraft(emptyCategory); await loadData();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar a categoria."); }
    finally { setSaving(false); }
  }

  async function deleteCategory(category: Category) {
    if (!window.confirm(`Remover a categoria “${category.name}”? Ela precisa estar sem produtos.`)) return;
    const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error ?? "Não foi possível remover a categoria."); return; }
    setNotice("Categoria removida."); await loadData();
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(settingsDraft) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível salvar as configurações.");
      setNotice("Configurações da loja atualizadas."); await loadData();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar as configurações."); }
    finally { setSaving(false); }
  }

  async function signOut() {
    await authClient.signOut(); router.replace("/admin/login"); router.refresh();
  }

  return <main className="admin-shell">
    <header className="admin-header">
      <Link href="/" className="admin-header-brand"><Image src="/amareli-logo.jpeg" alt="Amareli" width={48} height={48} /><span><strong>Amareli</strong><small>ADMINISTRAÇÃO</small></span></Link>
      <div className="admin-user"><span className="admin-user-name">{user.name}<small>{user.email}</small></span><button type="button" onClick={signOut} aria-label="Sair do painel"><LogOut size={16} /><span>Sair</span></button></div>
    </header>
    <section className="admin-main">
      <div className="admin-title-row"><div><div className="admin-eyebrow">ESPAÇO DA CONFEITARIA</div><h1>Seu ateliê, em boas mãos.</h1><p>Gerencie produtos, categorias e informações da loja.</p></div><Link href="/" className="admin-store-link"><ChevronLeft size={16} /> Ver loja</Link></div>
      <nav className="admin-tabs" aria-label="Seções do painel">
        <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}><Package size={16} />Produtos <span>{data.products.length}</span></button>
        <button className={tab === "categories" ? "active" : ""} onClick={() => setTab("categories")}><Boxes size={16} />Categorias <span>{data.categories.length}</span></button>
        <button className={tab === "store" ? "active" : ""} onClick={() => setTab("store")}><Settings2 size={16} />Loja e promoção</button>
      </nav>
      {error && <div className="admin-feedback error" role="alert">{error}</div>}
      {notice && <div className="admin-feedback success" role="status"><Check size={15} />{notice}</div>}
      <>
        {tab === "products" && <section className="admin-content-grid">
          <form id="admin-product-form" className="admin-card admin-editor" onSubmit={saveProduct}>
            <div className="admin-card-heading"><span className="admin-icon-box"><ImagePlus size={17} /></span><div><h2>{productId ? "Editar produto" : "Novo produto"}</h2><p>As alterações aparecem no catálogo da loja.</p></div></div>
            <label>Nome do produto<input required minLength={2} maxLength={100} value={productDraft.name} onChange={(event) => setProductDraft((draft) => ({ ...draft, name: event.target.value, slug: productId ? draft.slug : toSlug(event.target.value) }))} placeholder="Ex.: Brownie de Ninho" /></label>
            <div className="admin-two-fields"><label>Identificador (URL)<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} value={productDraft.slug} onChange={(event) => setProductDraft((draft) => ({ ...draft, slug: event.target.value }))} placeholder="brownie-de-ninho" /></label><label>Preço (R$)<input required inputMode="decimal" value={productDraft.price} onChange={(event) => setProductDraft((draft) => ({ ...draft, price: event.target.value }))} placeholder="6,00" /></label></div>
            <label>Categoria<span className="admin-select-wrap"><select required value={productDraft.categoryId} onChange={(event) => setProductDraft((draft) => ({ ...draft, categoryId: event.target.value }))}><option value="" disabled>Selecione</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.emoji} {category.name}</option>)}</select><ChevronDown size={15} /></span></label>
            <label>Descrição<textarea required minLength={3} maxLength={1000} rows={3} value={productDraft.description} onChange={(event) => setProductDraft((draft) => ({ ...draft, description: event.target.value }))} placeholder="Descreva o doce e seus recheios…" /></label>
            <label>Imagem (URL)<input required type="url" maxLength={1000} value={productDraft.imageUrl} onChange={(event) => setProductDraft((draft) => ({ ...draft, imageUrl: event.target.value }))} placeholder="https://…" /></label>
            {productDraft.imageUrl && <div className="admin-image-preview"><Image src={productDraft.imageUrl} alt="Prévia do produto" fill sizes="(max-width: 700px) 90vw, 360px" unoptimized /></div>}
            <div className="admin-switches"><label><input type="checkbox" checked={productDraft.available} onChange={(event) => setProductDraft((draft) => ({ ...draft, available: event.target.checked }))} /><span>Disponível para pedidos</span></label><label><input type="checkbox" checked={productDraft.featured} onChange={(event) => setProductDraft((draft) => ({ ...draft, featured: event.target.checked }))} /><span>Destacar na vitrine</span></label></div>
            <div className="admin-form-actions"><button className="admin-primary-button" disabled={saving || data.categories.length === 0}>{saving ? <LoaderCircle size={15} className="spin" /> : <Check size={15} />}{productId ? "Salvar alterações" : "Cadastrar produto"}</button>{productId && <button type="button" className="admin-secondary-button" onClick={() => { setProductId(null); setProductDraft(emptyProduct); }}>Cancelar edição</button>}</div>
            {data.categories.length === 0 && <small className="admin-hint">Crie uma categoria antes de cadastrar produtos.</small>}
          </form>
          <section className="admin-card admin-product-list">
            <div className="admin-list-heading"><div><div className="admin-eyebrow">SEU CATÁLOGO</div><h2>Produtos cadastrados</h2></div><button className="admin-primary-button compact" onClick={startNewProduct}><CirclePlus size={16} />Novo produto</button></div>
            <label className="admin-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produtos…" /></label>
            <div className="admin-products">
              {visibleProducts.length === 0 ? <p className="admin-empty">{data.products.length ? "Nenhum produto encontrado." : "Ainda não há produtos no banco. Rode o seed ou cadastre o primeiro produto."}</p> : visibleProducts.map((product) => <article className="admin-product-row" key={product.id}>
                <div className="admin-product-photo"><Image src={product.imageUrl} alt="" fill sizes="56px" unoptimized /></div>
                <div className="admin-product-copy"><h3>{product.name} {product.featured && <Star size={12} fill="currentColor" aria-label="Destaque" />}</h3><p>{product.category.emoji} {product.category.name} · {formatMoney(product.priceCents)}</p><span className={product.available ? "status-available" : "status-paused"}>{product.available ? "Disponível" : "Indisponível"}</span></div>
                <div className="admin-row-actions"><button onClick={() => startEditProduct(product)} aria-label={`Editar ${product.name}`}><Pencil size={15} /></button><button onClick={() => void deleteProduct(product)} aria-label={`Remover ${product.name}`}><Trash2 size={15} /></button></div>
              </article>)}
            </div>
          </section>
        </section>}
        {tab === "categories" && <section className="admin-content-grid categories-grid">
          <form className="admin-card admin-editor" onSubmit={saveCategory}>
            <div className="admin-card-heading"><span className="admin-icon-box"><Boxes size={17} /></span><div><h2>{categoryId ? "Editar categoria" : "Nova categoria"}</h2><p>Organize o catálogo por tipo de doce.</p></div></div>
            <div className="admin-two-fields"><label>Nome<input required maxLength={80} value={categoryDraft.name} onChange={(event) => setCategoryDraft((draft) => ({ ...draft, name: event.target.value, slug: categoryId ? draft.slug : toSlug(event.target.value) }))} placeholder="Ex.: Brownies" /></label><label>Ícone<input required maxLength={12} value={categoryDraft.emoji} onChange={(event) => setCategoryDraft((draft) => ({ ...draft, emoji: event.target.value }))} placeholder="🍫" /></label></div>
            <label>Identificador (URL)<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} value={categoryDraft.slug} onChange={(event) => setCategoryDraft((draft) => ({ ...draft, slug: event.target.value }))} placeholder="brownies" /></label>
            <label>Ordem na vitrine<input type="number" required min={0} max={1000} value={categoryDraft.sortOrder} onChange={(event) => setCategoryDraft((draft) => ({ ...draft, sortOrder: event.target.value }))} /></label>
            <div className="admin-form-actions"><button className="admin-primary-button" disabled={saving}>{saving ? <LoaderCircle size={15} className="spin" /> : <Check size={15} />}{categoryId ? "Salvar categoria" : "Criar categoria"}</button>{categoryId && <button type="button" className="admin-secondary-button" onClick={() => { setCategoryId(null); setCategoryDraft(emptyCategory); }}>Cancelar</button>}</div>
          </form>
          <section className="admin-card"><div className="admin-eyebrow">ORGANIZAÇÃO</div><h2 className="admin-section-heading">Categorias da loja</h2><div className="admin-category-list">{data.categories.map((category) => <article key={category.id} className="admin-category-row"><span className="admin-category-emoji">{category.emoji}</span><div><h3>{category.name}</h3><p>{category.slug} · {data.products.filter((product) => product.categoryId === category.id).length} produtos</p></div><div className="admin-row-actions"><button onClick={() => startEditCategory(category)} aria-label={`Editar ${category.name}`}><Pencil size={15} /></button><button onClick={() => void deleteCategory(category)} aria-label={`Remover ${category.name}`}><Trash2 size={15} /></button></div></article>)}</div></section>
        </section>}
        {tab === "store" && <form className="admin-card admin-settings-card" onSubmit={saveSettings}>
          <div className="admin-card-heading"><span className="admin-icon-box"><Settings2 size={17} /></span><div><h2>Informações comerciais</h2><p>Esses dados são usados na loja e no atendimento.</p></div></div>
          <label>Nome da confeitaria<input required maxLength={100} value={settingsDraft.storeName} onChange={(event) => setSettingsDraft((settings) => ({ ...settings, storeName: event.target.value }))} /></label>
          <label>WhatsApp que recebe os pedidos<input required inputMode="numeric" maxLength={15} value={settingsDraft.whatsappNumber} onChange={(event) => setSettingsDraft((settings) => ({ ...settings, whatsappNumber: event.target.value.replace(/\D/g, "") }))} /><small>Formato internacional, somente números. Ex.: 5582991140378</small></label>
          <label>Mensagem da promoção do mês<textarea required maxLength={500} rows={3} value={settingsDraft.monthlyPromotion} onChange={(event) => setSettingsDraft((settings) => ({ ...settings, monthlyPromotion: event.target.value }))} /></label>
          <fieldset className="admin-payment-options"><legend>Formas de pagamento aceitas</legend>{["Pix", "Dinheiro", "Cartão"].map((method) => <label key={method}><input type="checkbox" checked={settingsDraft.acceptedPayments.includes(method)} onChange={(event) => setSettingsDraft((settings) => ({ ...settings, acceptedPayments: event.target.checked ? [...settings.acceptedPayments, method] : settings.acceptedPayments.filter((item) => item !== method) }))} />{method}</label>)}</fieldset>
          <button className="admin-primary-button" disabled={saving}>{saving ? <LoaderCircle size={15} className="spin" /> : <Check size={15} />}Salvar configurações</button>
        </form>}
      </>
      <footer className="admin-footer">Área restrita à equipe da Amareli · <Link href="/">Ver vitrine pública</Link></footer>
    </section>
  </main>;
}

function parsePrice(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [reais, cents = ""] = normalized.split(".");
  const result = Number(reais) * 100 + Number(cents.padEnd(2, "0"));
  return Number.isSafeInteger(result) && result > 0 ? result : null;
}

function centsToInput(cents: number) { return `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, "0")}`; }
function toSlug(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
