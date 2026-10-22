
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  ShoppingBag,
  Users,
  Heart,
  Eye,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  Plus,
  Minus,
  Search,
} from "lucide-react";

import {
  getServices,
  createSmmOrder,
  getCryptoWalletBalances,
  createCryptoSmmOrder,
  calculateCryptoUsdCost,
  type SmmService,
  type CryptoAsset,
  type CryptoWalletBalances,
} from "../lib/api";

interface MarketProps {
  balance: number;
  setBalance: Dispatch<SetStateAction<number>>;
}

/*
|--------------------------------------------------------------------------
| Service icon
|--------------------------------------------------------------------------
*/

function ServiceIcon({
  service,
}: {
  service: SmmService;
}) {
  const name = service.name.toLowerCase();

  if (name.includes("member")) {
    return <Users size={24} />;
  }

  if (name.includes("reaction")) {
    return <Heart size={24} />;
  }

  if (name.includes("view")) {
    return <Eye size={24} />;
  }

  return <Send size={24} />;
}

/*
|--------------------------------------------------------------------------
| Service category
|--------------------------------------------------------------------------
*/

function getServiceCategory(
  service: SmmService
) {
  const name = service.name.toLowerCase();

  if (name.includes("member")) {
    return "Growth";
  }

  if (name.includes("reaction")) {
    return "Engagement";
  }

  if (name.includes("view")) {
    return "Reach";
  }

  return "Telegram";
}

/*
|--------------------------------------------------------------------------
| Market
|--------------------------------------------------------------------------
*/

export default function Market({
  balance,
  setBalance,
}: MarketProps) {
  const [services, setServices] =
    useState<SmmService[]>([]);

  const [
    selectedServiceId,
    setSelectedServiceId,
  ] = useState<string>("");

  const [target, setTarget] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [ordering, setOrdering] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<"coins" | "crypto">("coins");
  const [cryptoAsset, setCryptoAsset] =
    useState<CryptoAsset>("USDT-BSC");
  const [cryptoWallet, setCryptoWallet] =
    useState<CryptoWalletBalances>({ USDTBSC: 0, USDTTRC20: 0, BTC: 0 });
  const [cryptoWalletLoading, setCryptoWalletLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("All");
  const orderFormRef =
    useRef<HTMLElement | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Load services
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getServices();

        setServices(result);

        if (result.length > 0) {
          setSelectedServiceId(
            result[0].id
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Could not load services"
        );
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  useEffect(() => {
    if (paymentMethod !== "crypto") return;
    let cancelled = false;
    async function loadCryptoWallet() {
      try {
        setCryptoWalletLoading(true);
        const wallet = await getCryptoWalletBalances();
        if (!cancelled) setCryptoWallet(wallet);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load crypto wallet.");
      } finally {
        if (!cancelled) setCryptoWalletLoading(false);
      }
    }
    void loadCryptoWallet();
    return () => { cancelled = true; };
  }, [paymentMethod]);

  /*
  |--------------------------------------------------------------------------
  | Selected service
  |--------------------------------------------------------------------------
  */

  const selectedService =
    useMemo(
      () =>
        services.find(
          (service) =>
            service.id ===
            selectedServiceId
        ) || null,
      [
        services,
        selectedServiceId,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Quantity
  |--------------------------------------------------------------------------
  */

  const quantityNumber =
    Number(quantity);

  /*
  |--------------------------------------------------------------------------
  | Estimated price
  |--------------------------------------------------------------------------
  */

  const estimatedCost =
    selectedService &&
    Number.isFinite(
      quantityNumber
    ) &&
    quantityNumber > 0
      ? Math.ceil(
          (quantityNumber *
            selectedService.sellingPrice) /
            1000
        )
      : 0;

  /*
  |--------------------------------------------------------------------------
  | Balance after order
  |--------------------------------------------------------------------------
  */

  const remainingBalance =
    balance - estimatedCost;

  const cryptoAssetKey = {
    "USDT-BSC": "USDTBSC",
    "USDT-TRC20": "USDTTRC20",
    BTC: "BTC",
  } as const;
  const selectedCryptoBalance = cryptoWallet[cryptoAssetKey[cryptoAsset]];
  const cryptoPricePerThousand = Number(selectedService?.cryptoPriceUsd ?? 0);
  const cryptoPricingAvailable =
    Number.isFinite(cryptoPricePerThousand) && cryptoPricePerThousand > 0;
  const estimatedUsdCost =
    selectedService && cryptoPricingAvailable
      ? calculateCryptoUsdCost(
          quantityNumber,
          selectedService.cryptoPriceUsd
        )
      : 0;

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          services.map((service) =>
            getServiceCategory(service)
          )
        )
      ),
    ],
    [services]
  );

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesCategory =
        categoryFilter === "All" ||
        getServiceCategory(service) ===
          categoryFilter;

      const matchesSearch =
        !term ||
        service.name
          .toLowerCase()
          .includes(term) ||
        (service.description || "")
          .toLowerCase()
          .includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [services, search, categoryFilter]);

  const quantityPresets = selectedService
    ? Array.from(
        new Set([
          selectedService.minQuantity,
          1000,
          5000,
          10000,
          selectedService.maxQuantity,
        ])
      )
        .filter(
          (value) =>
            value >= selectedService.minQuantity &&
            value <= selectedService.maxQuantity
        )
        .sort((a, b) => a - b)
        .slice(0, 5)
    : [];

  /*
  |--------------------------------------------------------------------------
  | Quantity helpers
  |--------------------------------------------------------------------------
  */

  function increaseQuantity() {
    if (!selectedService) {
      return;
    }

    const current =
      Number(quantity) || 0;

    const next =
      current +
      selectedService.minQuantity;

    setQuantity(
      String(
        Math.min(
          next,
          selectedService.maxQuantity
        )
      )
    );

    setError(null);
  }

  function decreaseQuantity() {
    if (!selectedService) {
      return;
    }

    const current =
      Number(quantity) || 0;

    const next =
      Math.max(
        0,
        current -
          selectedService.minQuantity
      );

    setQuantity(
      next > 0
        ? String(next)
        : ""
    );

    setError(null);
  }

  /*
  |--------------------------------------------------------------------------
  | Select service
  |--------------------------------------------------------------------------
  */

  function selectService(
    serviceId: string
  ) {
    const service =
      services.find(
        (item) =>
          item.id === serviceId
      );

    setSelectedServiceId(
      serviceId
    );

    setError(null);
    setSuccess(null);

    /*
    Reset quantity when service
    changes so the user doesn't
    accidentally use the previous
    service's quantity.
    */

    if (service) {
      setQuantity("");
    }

    // Bring the order form into view so the user
    // does not have to scroll down to find it.
    window.setTimeout(() => {
      orderFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  }

  /*
  |--------------------------------------------------------------------------
  | Submit order
  |--------------------------------------------------------------------------
  */

  async function handleOrder() {
    setError(null);
    setSuccess(null);

    if (!selectedService) {
      setError(
        "Please select a service."
      );
      return;
    }

    if (!target.trim()) {
      setError(
        "Please enter your Telegram target."
      );
      return;
    }

    if (
      !Number.isInteger(
        quantityNumber
      ) ||
      quantityNumber <= 0
    ) {
      setError(
        "Please enter a valid quantity."
      );
      return;
    }

    if (
      quantityNumber <
      selectedService.minQuantity
    ) {
      setError(
        `Minimum quantity is ${selectedService.minQuantity.toLocaleString()}.`
      );
      return;
    }

    if (
      quantityNumber >
      selectedService.maxQuantity
    ) {
      setError(
        `Maximum quantity is ${selectedService.maxQuantity.toLocaleString()}.`
      );
      return;
    }

    if (paymentMethod === "coins" && balance < estimatedCost) {
      setError("You do not have enough Coins for this order.");
      return;
    }
    if (paymentMethod === "crypto" && !cryptoPricingAvailable) {
      setError("Crypto pricing is not configured for this service yet. Please use Coins or contact support.");
      return;
    }
    if (paymentMethod === "crypto" && cryptoWalletLoading) {
      setError("Please wait while your crypto wallet loads.");
      return;
    }

    try {
      setOrdering(true);
      if (paymentMethod === "coins") {
        const order = await createSmmOrder(selectedService.id, target.trim(), quantityNumber);
        setBalance(Number(order.balance));
        setSuccess(`Order #${order.orderNumber.toLocaleString()} created successfully using Coins.`);
      } else {
        const order = await createCryptoSmmOrder(selectedService.id, target.trim(), quantityNumber, cryptoAsset);
        setCryptoWallet((previous) => ({ ...previous, [cryptoAssetKey[cryptoAsset]]: Number(order.balance) }));
        setSuccess(`Order #${order.orderNumber} created. Paid ${Number(order.cryptoAmount).toLocaleString(undefined, { maximumFractionDigits: cryptoAsset === "BTC" ? 8 : 4 })} ${cryptoAsset}.`);
      }
      setTarget("");
      setQuantity("");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not create order"
      );
    } finally {
      setOrdering(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="market-page">

        <div className="market-header">

          <div>
            <p className="page-eyebrow">
              ChannelFix MARKET
            </p>

            <h1>
              Market
            </h1>

            <p>
              Grow your Telegram community
              with Coins.
            </p>
          </div>

          <div className="market-header-icon">
            <ShoppingBag size={24} />
          </div>

        </div>

        <div className="market-loading">

          <Loader2
            size={30}
            className="spin"
          />

          <p>
            Loading Telegram services...
          </p>

        </div>

      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="market-page">

      {/* =========================================
          TOP BAR
      ========================================= */}

      <div className="market-topbar">

        <div>
          <h1>Market</h1>
          <p>Pick a service, add your details, then pay.</p>
        </div>

        <div className="market-balance-chip">
          <span>🪙</span>
          <strong>{balance.toLocaleString()}</strong>
        </div>

      </div>

      {!selectedService && error && (
        <div className="market-message error">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}

      {!selectedService && success && (
        <div className="market-message success">
          <CheckCircle2 size={19} />
          <span>{success}</span>
        </div>
      )}


      {/* =========================================
          SERVICES
      ========================================= */}

      <section className="market-section">

        <div className="step-title">
          <span className="step-number">1</span>
          <h2>Choose a service</h2>
          <span className="service-count">
            {filteredServices.length}
          </span>
        </div>


        {services.length > 4 && (
          <div className="market-toolbar">

            <div className="market-search">
              <Search size={15} />
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search services"
              />
            </div>

            {categories.length > 2 && (
              <div className="category-chips">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={`category-chip ${
                      categoryFilter === category
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setCategoryFilter(category)
                    }
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

          </div>
        )}

        <div className="services-grid">

          {filteredServices.length === 0 && (
            <div className="services-empty">
              No services match your search.
            </div>
          )}

          {filteredServices.map((service) => {
            const selected =
              selectedServiceId === service.id;

            return (
              <button
                type="button"
                key={service.id}
                className={`service-card ${
                  selected ? "selected" : ""
                }`}
                onClick={() =>
                  selectService(service.id)
                }
              >

                <div className="service-icon">
                  <ServiceIcon
                    service={service}
                  />
                </div>

                <div className="service-info">

                  <div className="service-title-row">
                    <strong>
                      {service.name}
                    </strong>

                    <span className="service-category">
                      {getServiceCategory(
                        service
                      )}
                    </span>
                  </div>

                  {service.description && (
                    <p>{service.description}</p>
                  )}

                </div>

                <div className="service-side">

                  <div className="service-price">
                    <span>
                      {service.sellingPrice.toLocaleString()}
                      {" "}
                      Coins
                    </span>

                    <small>/ 1K</small>
                  </div>

                  {selected ? (
                    <CheckCircle2
                      size={16}
                      className="service-selected"
                    />
                  ) : (
                    <ArrowRight
                      size={15}
                      className="service-chevron"
                    />
                  )}

                </div>

              </button>
            );
          })}

        </div>

      </section>


      {/* =========================================
          ORDER FORM
      ========================================= */}

      {selectedService && (
        <section
          className="market-section"
          ref={orderFormRef}
        >

          <div className="step-title">
            <span className="step-number">2</span>
            <h2>Order details</h2>
          </div>


          <div className="order-form">

            {/* =================================
                SELECTED SERVICE + FULL DESCRIPTION
            ================================= */}

            <div className="selected-service">

              <div className="selected-service-icon">
                <ServiceIcon service={selectedService} />
              </div>

              <div className="selected-service-details">
                <strong>{selectedService.name}</strong>
                <span>
                  {selectedService.sellingPrice.toLocaleString()} Coins / 1K
                </span>
              </div>

              <CheckCircle2
                size={19}
                className="selected-check"
              />

            </div>

            {selectedService.description && (
              <div className="service-description">
                <label>About this service</label>
                <p>{selectedService.description}</p>
              </div>
            )}


            {/* =================================
                TARGET
            ================================= */}

            <div className="form-group">

              <label>
                Telegram Target
              </label>

              <input
                type="text"
                value={target}
                onChange={(event) =>
                  setTarget(
                    event.target.value
                  )
                }
                placeholder="@username or Telegram link"
                maxLength={500}
              />

              <small>
                Username, channel, group or post link.
              </small>

            </div>


            {/* =================================
                QUANTITY
            ================================= */}

            <div className="form-group">

              <label>
                Quantity
              </label>

              <div className="quantity-input-wrap">

                <button
                  type="button"
                  className="quantity-button"
                  onClick={
                    decreaseQuantity
                  }
                  disabled={
                    !quantity ||
                    Number(quantity) <=
                      0
                  }
                >
                  <Minus size={17} />
                </button>

                <input
                  type="number"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      event.target.value
                    )
                  }
                  placeholder={
                    `${selectedService.minQuantity} - ${selectedService.maxQuantity}`
                  }
                  min={
                    selectedService.minQuantity
                  }
                  max={
                    selectedService.maxQuantity
                  }
                />

                <button
                  type="button"
                  className="quantity-button"
                  onClick={
                    increaseQuantity
                  }
                  disabled={
                    Number(quantity) >=
                    selectedService.maxQuantity
                  }
                >
                  <Plus size={17} />
                </button>

              </div>

              {quantityPresets.length > 0 && (
                <div className="quantity-presets">
                  {quantityPresets.map((value) => (
                    <button
                      type="button"
                      key={value}
                      className={`quantity-preset ${
                        Number(quantity) === value
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setQuantity(String(value));
                        setError(null);
                      }}
                    >
                      {value.toLocaleString()}
                    </button>
                  ))}
                </div>
              )}

              <small>

                Minimum{" "}
                {selectedService.minQuantity.toLocaleString()}
                {" • "}
                Maximum{" "}
                {selectedService.maxQuantity.toLocaleString()}

              </small>

            </div>


            {/* =================================
                PAYMENT METHOD
            ================================= */}
            <div className="step-title step-title-inline">
              <span className="step-number">3</span>
              <h2>Payment</h2>
            </div>

            <div className="form-group">
              <div className="payment-method-options">
                <button type="button" className={`payment-method-option ${paymentMethod === "coins" ? "selected" : ""}`} onClick={() => { setPaymentMethod("coins"); setError(null); setSuccess(null); }}>🪙 Pay with Coins</button>
                <button type="button" className={`payment-method-option ${paymentMethod === "crypto" ? "selected" : ""}`} onClick={() => { setPaymentMethod("crypto"); setError(null); setSuccess(null); }}>₿ Pay with Crypto</button>
              </div>
              {paymentMethod === "crypto" && (
                <>
                  <label htmlFor="market-crypto-asset" style={{ marginTop: 12, display: "block" }}>Crypto asset</label>
                  <select id="market-crypto-asset" value={cryptoAsset} onChange={(event) => setCryptoAsset(event.target.value as CryptoAsset)} className="market-crypto-select">
                    <option value="USDT-BSC">USDT (BSC / BEP20)</option>
                    <option value="USDT-TRC20">USDT (TRC20)</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                  </select>
                  <div className="crypto-balance-panel">
                    <span>{cryptoWalletLoading ? "Loading wallet balance…" : `${cryptoAsset} available`}</span>
                    <strong>{selectedCryptoBalance.toLocaleString(undefined, { maximumFractionDigits: cryptoAsset === "BTC" ? 8 : 4 })}</strong>
                  </div>
                  {!cryptoPricingAvailable && <small>Crypto is not available for this service. Please pay with Coins.</small>}
                </>
              )}
            </div>

            {/* =================================
                ORDER SUMMARY
            ================================= */}

            <div className="order-summary">

              <div className="summary-row total">

                <span>Total</span>

                <strong>
                  {paymentMethod === "coins"
                    ? `${estimatedCost.toLocaleString()} Coins`
                    : `$${estimatedUsdCost.toFixed(
                        estimatedUsdCost > 0 && estimatedUsdCost < 0.01 ? 4 : 2
                      )} USD`}
                </strong>

              </div>

              {paymentMethod === "coins" && estimatedCost > 0 && (
                <div className={`balance-after ${remainingBalance >= 0 ? "positive" : "negative"}`}>
                  <span>Balance after order</span>
                  <strong>{remainingBalance >= 0 ? remainingBalance.toLocaleString() : "Insufficient Coins"}</strong>
                </div>
              )}

            </div>


            {error && (
              <div className="market-message error">
                <AlertCircle size={19} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="market-message success">
                <CheckCircle2 size={19} />
                <span>{success}</span>
              </div>
            )}


            {/* =================================
                PLACE ORDER
            ================================= */}

            <button
              type="button"
              className="place-order-button"
              onClick={handleOrder}
              disabled={
                ordering ||
                !selectedService ||
                !target.trim() ||
                !Number.isInteger(quantityNumber) ||
                quantityNumber <= 0 ||
                (paymentMethod === "crypto" && (!cryptoPricingAvailable || cryptoWalletLoading))
              }
            >

              {ordering ? (
                <>
                  <Loader2
                    size={19}
                    className="spin"
                  />

                  Creating Order...
                </>
              ) : (
                <>
                  <ShoppingBag size={19} />

                  Place Order

                  <ArrowRight
                    size={18}
                  />
                </>
              )}

            </button>

          </div>

        </section>
      )}

    </div>
  );
}

