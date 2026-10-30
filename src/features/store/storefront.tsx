"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, Check, ChevronDown, Gift, Heart, Minus, Plus, ShoppingBag, Sparkles, Trash2, X } from "lucide-react";
import { boxFlavors, boxPrices, bowColors, filterProducts, productOrderLabel, type CatalogProduct, type Category } from "@/features/store/catalog";
import { cartEntrySchema } from "@/features/store/checkout-schema";
import { createCartId } from "@/features/store/cart-id";
import { formatMoney } from "@/lib/money";

type ProductEntry = { kind: "product"; id: string; slug: string; quantity: number };
type BoxEntry = { kind: "box"; id: string; size: 2 | 4; flavors: string[]; bowColor: string };
type CartEntry = ProductEntry | BoxEntry;

type StorefrontProps = {
  products: CatalogProduct[];
  categories: Category[];
  storeName: string;
  promotion: string;
  acceptedPayments: string[];
};

const formatBoxFlavor = (flavor: string) => flavor;

export function Storefront({ products, categories, storeName, promotion, acceptedPayments }: StorefrontProps) {
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [cartOpen, setCartOpen] = useState(false);
  const [boxSize, setBoxSize] = useState<2 | 4>(2);
  const [boxFlavorsSelected, setBoxFlavorsSelected] = useState<string[]>(Array(2).fill(boxFlavors[0]));
  const [boxBow, setBoxBow] = useState<string>(bowColors[0]);
  const [editingBox, setEditingBox] = useState<string | null>(null);
  const [checkoutPrepared, setCheckoutPrepared] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(acceptedPayments[0] ?? "");
  const [notes, setNotes] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem("amareli-cart-v1");
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          const validated = Array.isArray(parsed) ? parsed.map((entry) => cartEntrySchema.safeParse(entry)) : [];
          setCart(validated.flatMap((result) => result.success ? [result.data as CartEntry] : []));
        }
      } catch {
        localStorage.removeItem("amareli-cart-v1");
      }
      setCartLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    localStorage.setItem("amareli-cart-v1", JSON.stringify(cart));
  }, [cart, cartLoaded]);

  const filteredProducts = useMemo(() => filterProducts(products, activeCategory), [activeCategory, products]);

  const subtotal = useMemo(() => cart.reduce((sum, entry) => {
    if (entry.kind === "box") return sum + boxPrices[entry.size];
    const product = products.find((item) => item.slug === entry.slug);
    return sum + (product?.priceCents ?? 0) * entry.quantity;
  }, 0), [cart, products]);

  const count = cart.reduce((sum, entry) => sum + (entry.kind === "box" ? entry.size : entry.quantity), 0);

  function addProduct(product: CatalogProduct) {
    setCart((previous) => {
      const existing = previous.find((entry): entry is ProductEntry => entry.kind === "product" && entry.slug === product.slug);
      return existing
        ? previous.map((entry) => entry.kind === "product" && entry.slug === product.slug ? { ...entry, quantity: Math.min(entry.quantity + 1, 50) } : entry)
        : [...previous, { kind: "product", id: createCartId(), slug: product.slug, quantity: 1 }];
    });
    setAddedSlug(product.slug);
    window.setTimeout(() => setAddedSlug(null), 1300);
  }

  function setProductQuantity(slug: string, delta: number) {
    setCart((previous) => previous.flatMap((entry) => {
      if (entry.kind !== "product" || entry.slug !== slug) return [entry];
      const quantity = entry.quantity + delta;
      return quantity > 0 ? [{ ...entry, quantity: Math.min(quantity, 50) }] : [];
    }));
  }

  function addBox() {
    if (boxFlavorsSelected.length !== boxSize) return;
    setCart((previous) => [...previous, { kind: "box", id: createCartId(), size: boxSize, flavors: [...boxFlavorsSelected], bowColor: boxBow }]);
    setCartOpen(true);
  }

  function updateBoxFlavor(index: number, flavor: string) {
    setBoxFlavorsSelected((previous) => previous.map((item, itemIndex) => itemIndex === index ? flavor : item));
  }

  function selectBoxSize(value: 2 | 4) {
    setBoxSize(value);
    setBoxFlavorsSelected((previous) => Array.from({ length: value }, (_, index) => previous[index] ?? boxFlavors[0]));
  }

  function beginEditBox(entry: BoxEntry) {
    setEditingBox(entry.id);
    setBoxSize(entry.size);
    setBoxFlavorsSelected([...entry.flavors]);
    setBoxBow(entry.bowColor);
  }

  function saveBoxEdit() {
    if (!editingBox) return;
    setCart((previous) => previous.map((entry) => entry.kind === "box" && entry.id === editingBox
      ? { ...entry, size: boxSize, flavors: [...boxFlavorsSelected], bowColor: boxBow }
      : entry));
    setEditingBox(null);
  }

  function removeEntry(id: string) {
    setCart((previous) => previous.filter((entry) => entry.id !== id));
    if (editingBox === id) setEditingBox(null);
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckoutError("");
    setSubmitting(true);
    const popup = window.open("about:blank", "_blank");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customerName, customerPhone, paymentMethod, notes, cart }),
      });
      const result = await response.json() as { error?: string; url?: string };
      if (!response.ok || !result.url) throw new Error(result.error ?? "Não foi possível preparar seu pedido.");
      setWhatsappUrl(result.url);
      setCheckoutPrepared(true);
      if (popup) popup.location.href = result.url;
      else window.location.href = result.url;
    } catch (error) {
      popup?.close();
      setCheckoutError(error instanceof Error ? error.message : "Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  }

  function clearAfterConfirmation() {
    setCart([]);
    setCheckoutPrepared(false);
    setWhatsappUrl("");
    setCartOpen(false);
  }

  function closeCart() {
    setCartOpen(false);
    setCheckoutPrepared(false);
    setEditingBox(null);
    setCheckoutError("");
  }

  return (
    <main>
      <div className="announcement"><Sparkles size={13} /> Feito à mão, com carinho em cada detalhe <Sparkles size={13} /></div>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label={`${storeName}, início`}>
          <Image className="brand-logo" src="/amareli-logo.jpeg" alt="Logo Amareli Doces Artesanais" width={52} height={52} priority />
          <span><strong>{storeName}</strong><small>DOCES ARTESANAIS</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#catalogo">Cardápio</a><a href="#caixinhas">Presentes</a><a href="#sobre">Nossa essência</a>
        </nav>
        <button className="header-cart" onClick={() => setCartOpen(true)} aria-label={`Abrir sacola, ${count} doces`}>
          <ShoppingBag size={18} /><span>Sua sacola</span><b>{count}</b>
        </button>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow"><span /> FEITO COM AFETO, FEITO PARA VOCÊ</span>
          <h1>✨ Transformando qualquer dia em um <em>dia especial.</em></h1>
          <p>Doces feitos de forma artesanal, com carinho, capricho e ingredientes de qualidade.</p>
          <div className="hero-actions"><a className="button button-dark" href="#catalogo">Escolher meus doces <ArrowRight size={16} /></a><a className="text-link" href="#caixinhas">Montar presente <ArrowDown size={15} /></a></div>
          <div className="hero-note"><Heart size={15} fill="currentColor" /> Preparado fresquinho, do nosso ateliê até você.</div>
        </div>
        <div className="hero-art" role="img" aria-label="Brownies artesanais com chocolate e cobertura cremosa">
          <div className="hero-photo" />
          <div className="photo-label"><span>✳</span><div>feito com carinho<small>para adoçar seu dia</small></div></div>
          <div className="hero-stamp">um pedacinho<br />de felicidade</div>
        </div>
      </section>

      <section className="category-strip" aria-label="Categorias do cardápio">
        <div className="section-kicker">UM MUNDO DE SABORES</div>
        <div className="category-links">{categories.map((category) => <a key={category.slug} href="#catalogo" onClick={() => setActiveCategory(category.slug)}><span>{category.emoji}</span>{category.name}<ArrowDown size={13} /></a>)}</div>
      </section>

      <section className="catalog-section" id="catalogo">
        <div className="section-heading"><div><div className="section-kicker">ESCOLHIDOS COM CARINHO</div><h2>Nosso <em>cardápio</em></h2><p>Pequenos momentos, grandes doses de felicidade.</p></div><span className="handwritten">feito hoje, para você ♡</span></div>
        <div className="filter-row" role="group" aria-label="Filtrar produtos por categoria">
          <button className={activeCategory === "todos" ? "filter-pill active" : "filter-pill"} onClick={() => setActiveCategory("todos")}>Tudo</button>
          {categories.map((category) => <button key={category.slug} className={activeCategory === category.slug ? "filter-pill active" : "filter-pill"} onClick={() => setActiveCategory(category.slug)}>{category.emoji} {category.name}</button>)}
        </div>
        <div className="product-grid">
          {filteredProducts.map((product) => <article className="product-card" id={product.slug} key={product.slug}>
            <div className="product-photo"><Image src={product.imageUrl} alt={`${product.category.name} ${product.name}`} fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px" />{product.featured && <span className="product-tag">queridinho</span>}<span className="photo-category">{product.category.emoji}</span></div>
            <div className="product-info"><div className="product-category">{product.category.name.toUpperCase()}</div><h3>{product.name}</h3><p>{product.description}</p><div className="product-buy"><strong>{formatMoney(product.priceCents)} <small>/ un.</small></strong><button onClick={() => addProduct(product)} aria-label={`Adicionar ${product.name} ao carrinho`} className={addedSlug === product.slug ? "add-button added" : "add-button"}>{addedSlug === product.slug ? <Check size={18} /> : <Plus size={18} />}<span>{addedSlug === product.slug ? "Adicionado" : "Adicionar"}</span></button></div></div>
          </article>)}
        </div>
      </section>

      <section className="monthly-promo" aria-label="Ação promocional do mês">
        <div className="promo-burst"><Gift size={22} /><span>um mimo<br />especial!</span></div><div><div className="section-kicker">UM CARINHO A MAIS</div><h2>🎁 AÇÃO DO MÊS</h2><p>{promotion}</p></div><span className="promo-flower">✿</span>
      </section>

      <section className="box-section" id="caixinhas">
        <div className="box-copy"><div className="section-kicker">UM PRESENTE COM A SUA CARA</div><h2>Um laço, alguns <em>sabores</em> e muito amor.</h2><p>Monte uma caixinha especial, escolhendo cada brownie e a cor do laço. Um presente pensado por você, finalizado com carinho por nós.</p><div className="box-proof"><span>♡</span><div>Personalizado por você<small>Cada caixinha tem sabores únicos.</small></div></div></div>
        <div className="box-builder">
          <div className="builder-top"><span>MONTE SUA CAIXINHA</span><span>01 / ESCOLHA E PERSONALIZE</span></div>
          <label className="builder-label" htmlFor="box-size">Tamanho da caixinha</label>
          <div className="size-options"><button className={boxSize === 2 ? "size-option selected" : "size-option"} onClick={() => selectBoxSize(2)}><span>02 brownies</span><b>R$ 25,00</b></button><button className={boxSize === 4 ? "size-option selected" : "size-option"} onClick={() => selectBoxSize(4)}><span>04 brownies</span><b>R$ 35,00</b></button></div>
          <div className="flavor-list"><div className="builder-label">Escolha cada sabor <span>({boxSize} no total)</span></div>{boxFlavorsSelected.map((flavor, index) => <label className="flavor-select" key={index}><span>{String(index + 1).padStart(2, "0")}</span><select value={flavor} onChange={(event) => updateBoxFlavor(index, event.target.value)} aria-label={`Sabor do brownie ${index + 1}`}>{boxFlavors.map((option) => <option key={option} value={option}>{formatBoxFlavor(option)}</option>)}</select><ChevronDown size={15} /></label>)}</div>
          <div className="ribbon-picker"><div className="builder-label">Cor do laço</div><div className="ribbon-options">{bowColors.map((color) => <button key={color} onClick={() => setBoxBow(color)} className={boxBow === color ? "ribbon-option chosen" : "ribbon-option"} aria-pressed={boxBow === color}><i className={`ribbon-swatch ${color.toLowerCase()}`} />{color}</button>)}</div></div>
          <button className="button button-dark full-width" onClick={addBox}>Adicionar caixinha · {formatMoney(boxPrices[boxSize])}<ShoppingBag size={16} /></button>
          <p className="fixed-price-note"><Check size={13} /> O preço é fixo, independentemente dos sabores.</p>
        </div>
      </section>

      <section className="party-banner" id="encomendas"><div className="party-icon">✦</div><div><div className="section-kicker">MOMENTOS QUE MERECEM SER CELEBRADOS</div><h2>Uma festa, muitos mini brownies.</h2><p>Encomendas para festas e caixinhas personalizadas para presentear. Cada detalhe combinado com você.</p></div><a className="button button-light" href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5582991140378"}?text=${encodeURIComponent("Olá! Gostaria de saber sobre encomendas de mini brownies para festa e caixinhas para presente.")}`} target="_blank" rel="noreferrer">Falar sobre encomenda <ArrowRight size={16} /></a></section>

      <section className="promise-section" id="sobre"><div className="promise-title"><div className="section-kicker">FEITO NO NOSSO ATELIÊ</div><h2>O carinho também<br />é um <em>ingrediente.</em></h2></div><div className="promise-card"><span>01</span><Heart size={21} /><h3>Artesanal de verdade</h3><p>Feito à mão, em pequenas quantidades e com tempo para cuidar de cada detalhe.</p></div><div className="promise-card"><span>02</span><Sparkles size={21} /><h3>Ingredientes de qualidade</h3><p>Escolhas cuidadosas para que cada mordida tenha sabor de coisa boa.</p></div><div className="promise-card"><span>03</span><Gift size={21} /><h3>Presente com significado</h3><p>Uma caixinha montada por você deixa qualquer gesto ainda mais especial.</p></div></section>

      <section className="payment-strip"><div><span className="payment-flower">✿</span><div><strong>Um docinho para o seu dia</strong><small>Formas de pagamento: {acceptedPayments.join(", ")}.</small></div></div><a href="#catalogo">Escolher meus favoritos <ArrowRight size={15} /></a></section>

      <footer className="footer"><a className="brand" href="#inicio"><Image className="brand-logo footer-brand-logo" src="/amareli-logo.jpeg" alt="Logo Amareli Doces Artesanais" width={46} height={46} /><span><strong>{storeName}</strong><small>DOCES ARTESANAIS</small></span></a><span>Com carinho, do nosso ateliê para você. <Heart size={13} fill="currentColor" /></span><a href="#inicio">Voltar ao início ↑</a></footer>

      <button className="mobile-cart-fab" onClick={() => setCartOpen(true)} aria-label={`Abrir sacola com ${count} doces`}><ShoppingBag size={18} /> Sacola <b>{count}</b><span>{formatMoney(subtotal)}</span></button>

      {cartOpen && <div className="cart-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCart(); }}>
        <section className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
          <div className="cart-header"><div><div className="section-kicker">SEU PEDIDO, DO SEU JEITO</div><h2 id="cart-title">Sua sacola <span>({count})</span></h2></div><button className="icon-button" onClick={closeCart} aria-label="Fechar sacola"><X size={19} /></button></div>
          <div className="cart-content">
            {cart.length === 0 ? <div className="empty-cart"><div>♡</div><h3>Tem espaço para um docinho.</h3><p>Escolha seus favoritos no cardápio e eles aparecem aqui.</p><button className="button button-dark" onClick={closeCart}>Continuar escolhendo <ArrowRight size={16} /></button></div> : <>
              <div className="cart-lines">{cart.map((entry) => {
                if (entry.kind === "product") {
                  const product = products.find((item) => item.slug === entry.slug);
                  if (!product) return null;
                  return <div className="cart-line" key={entry.id}><div className="cart-thumb"><Image src={product.imageUrl} alt="" fill sizes="64px" /></div><div className="cart-line-main"><div className="cart-line-top"><div><h3>{productOrderLabel(product.category.slug, product.name)}</h3><p>{formatMoney(product.priceCents)} / un.</p></div><button className="remove-button" onClick={() => removeEntry(entry.id)} aria-label={`Remover ${product.name}`}><Trash2 size={15} /></button></div><div className="cart-line-bottom"><div className="quantity-control"><button onClick={() => setProductQuantity(entry.slug, -1)} aria-label={`Diminuir ${product.name}`}><Minus size={13} /></button><span>{entry.quantity}</span><button onClick={() => setProductQuantity(entry.slug, 1)} aria-label={`Aumentar ${product.name}`}><Plus size={13} /></button></div><strong>{formatMoney(product.priceCents * entry.quantity)}</strong></div></div></div>;
                }
                const editing = editingBox === entry.id;
                return <div className="cart-line box-cart-line" key={entry.id}><div className="box-thumb">♡</div><div className="cart-line-main"><div className="cart-line-top"><div><h3>Caixinha personalizada</h3><p>{entry.size} brownies · {formatMoney(boxPrices[entry.size])}</p></div><button className="remove-button" onClick={() => removeEntry(entry.id)} aria-label="Remover caixinha"><Trash2 size={15} /></button></div><p className="cart-box-detail">{entry.flavors.join(" · ")}<br />Laço {entry.bowColor.toLowerCase()}</p><button className="edit-box-button" onClick={() => editing ? setEditingBox(null) : beginEditBox(entry)}>{editing ? "Cancelar edição" : "Editar caixinha"}</button>{editing && <div className="edit-box-form"><div className="size-options"><button className={boxSize === 2 ? "size-option selected" : "size-option"} onClick={() => selectBoxSize(2)}><span>02 brownies</span><b>R$ 25,00</b></button><button className={boxSize === 4 ? "size-option selected" : "size-option"} onClick={() => selectBoxSize(4)}><span>04 brownies</span><b>R$ 35,00</b></button></div>{boxFlavorsSelected.map((flavor, index) => <label className="flavor-select" key={index}><span>{index + 1}</span><select value={flavor} onChange={(event) => updateBoxFlavor(index, event.target.value)} aria-label={`Editar brownie ${index + 1}`}>{boxFlavors.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></label>)}<div className="ribbon-options">{bowColors.map((color) => <button key={color} onClick={() => setBoxBow(color)} className={boxBow === color ? "ribbon-option chosen" : "ribbon-option"}><i className={`ribbon-swatch ${color.toLowerCase()}`} />{color}</button>)}</div><button className="save-edit" onClick={saveBoxEdit}>Salvar personalização</button></div>}</div></div>;
              })}</div>
              <div className="cart-totals"><div><span>Total do pedido</span><strong>{formatMoney(subtotal)}</strong></div><p>Recebimento por retirada.</p></div>
              {checkoutPrepared ? <div className="checkout-success"><div className="success-mark"><Check size={19} /></div><h3>Seu pedido está pronto no WhatsApp.</h3><p>Confira e envie a mensagem por lá. A confeitaria confirma o recebimento diretamente com você.</p><a className="button button-dark full-width" href={whatsappUrl} target="_blank" rel="noreferrer">Abrir WhatsApp <ArrowRight size={15} /></a><button className="clear-confirm-button" onClick={clearAfterConfirmation}>Já enviei o pedido · limpar sacola</button></div> : <form className="checkout-form" onSubmit={submitOrder}>
                <div className="checkout-heading"><div className="section-kicker">QUASE LÁ</div><h3>Para quem vamos preparar?</h3></div>
                <label>Seu nome<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Como podemos te chamar?" autoComplete="name" required minLength={2} maxLength={100} /></label>
                <label>Telefone para contato <span>opcional</span><input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="(82) 99999-9999" autoComplete="tel" maxLength={30} /></label>
                <label>Forma de pagamento<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} required><option value="" disabled>Selecione uma opção</option>{acceptedPayments.map((method) => <option key={method} value={method}>{method}</option>)}</select></label>
                <label>Observações <span>opcional</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Algum detalhe especial?" rows={2} maxLength={500} /></label>
                {checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}
                <p className="checkout-disclaimer">Recebimento por retirada. Seu pedido só fica confirmado após o retorno da equipe.</p>
                <button className="button button-dark full-width" type="submit" disabled={submitting}>{submitting ? "Preparando seu pedido…" : "Finalizar pelo WhatsApp"}<ArrowRight size={16} /></button>
              </form>}
            </>}
          </div>
          <div className="drawer-bottom"><span><Heart size={13} fill="currentColor" /> Feito com carinho, pra você.</span><a href="#catalogo" onClick={closeCart}>Continuar comprando</a></div>
        </section>
      </div>}
    </main>
  );
}
