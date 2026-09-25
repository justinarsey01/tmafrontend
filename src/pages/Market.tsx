
import {
  useEffect,
  useMemo,
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
  ShieldCheck,
  Zap,
  Plus,
  Minus,
} from "lucide-react";

import {
  getServices,
  createSmmOrder,
  type SmmService,
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

    if (
      balance <
      estimatedCost
    ) {
      setError(
        "You do not have enough Coins for this order."
      );
      return;
    }

    try {
      setOrdering(true);

      const order =
        await createSmmOrder(
          selectedService.id,
          target.trim(),
          quantityNumber
        );

      /*
      ----------------------------------------------
      Backend remains authoritative
      ----------------------------------------------
      */

      setBalance(
        Number(order.balance)
      );

      setSuccess(
        `Order #${order.orderNumber.toLocaleString()} created successfully.`
      );

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
              COINEARN MARKET
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
          HEADER
      ========================================= */}

      <div className="market-header">

        <div>

          <p className="page-eyebrow">
            COINEARN MARKET
          </p>

          <h1>
            Telegram Market
          </h1>

          <p>
            Use your Coins to grow and
            engage your Telegram community.
          </p>

        </div>

        <div className="market-header-icon">
          <ShoppingBag size={24} />
        </div>

      </div>


      {/* =========================================
          BALANCE
      ========================================= */}

      <div className="market-balance-card">

        <div className="market-balance-content">

          <div className="market-balance-label">
            <CoinsIcon />
            Available Coins
          </div>

          <strong>
            {balance.toLocaleString()}
          </strong>

          <span>
            Ready to spend
          </span>

        </div>

        <div className="balance-coin">
          🪙
        </div>

      </div>


      {/* =========================================
          TRUST / SECURITY
      ========================================= */}

      <div className="market-trust-row">

        <div>
          <ShieldCheck size={15} />
          Secure orders
        </div>

        <div>
          <Zap size={15} />
          Fast processing
        </div>

      </div>


      {/* =========================================
          MESSAGES
      ========================================= */}

      {error && (
        <div className="market-message error">

          <AlertCircle size={19} />

          <span>
            {error}
          </span>

        </div>
      )}

      {success && (
        <div className="market-message success">

          <CheckCircle2 size={19} />

          <span>
            {success}
          </span>

        </div>
      )}


      {/* =========================================
          SERVICES
      ========================================= */}

      <section className="market-section">

        <div className="section-heading">

          <div>

            <p>
              CHOOSE A SERVICE
            </p>

            <h2>
              Telegram Services
            </h2>

          </div>

          <span className="service-count">
            {services.length}
          </span>

        </div>


        <div className="services-grid">

          {services.map(
            (service) => {

              const selected =
                selectedServiceId ===
                service.id;

              return (
                <button
                  type="button"
                  key={service.id}
                  className={
                    `service-card ${
                      selected
                        ? "selected"
                        : ""
                    }`
                  }
                  onClick={() =>
                    selectService(
                      service.id
                    )
                  }
                >

                  <div
                    className="service-card-top"
                  >

                    <div className="service-icon">

                      <ServiceIcon
                        service={service}
                      />

                    </div>

                    {selected && (
                      <div className="service-selected">
                        <CheckCircle2
                          size={17}
                        />
                      </div>
                    )}

                  </div>


                  <div className="service-info">

                    <div className="service-category">
                      {getServiceCategory(
                        service
                      )}
                    </div>

                    <strong>
                      {service.name}
                    </strong>

                    <p>
                      {service.description}
                    </p>

                    <div className="service-price">

                      <span>
                        {service.sellingPrice.toLocaleString()}
                        {" "}
                        Coins
                      </span>

                      <small>
                        / 1K
                      </small>

                    </div>

                  </div>


                  <ArrowRight
                    size={16}
                    className="service-arrow"
                  />

                </button>
              );
            }
          )}

        </div>

      </section>


      {/* =========================================
          ORDER FORM
      ========================================= */}

      {selectedService && (
        <section className="market-section">

          <div className="section-heading">

            <div>

              <p>
                NEW ORDER
              </p>

              <h2>
                Create Order
              </h2>

            </div>

          </div>


          <div className="order-form">

            {/* =================================
                SELECTED SERVICE
            ================================= */}

            <div className="form-group">

              <label>
                Selected Service
              </label>

              <div className="selected-service">

                <div className="selected-service-icon">

                  <ServiceIcon
                    service={
                      selectedService
                    }
                  />

                </div>

                <div className="selected-service-details">

                  <strong>
                    {selectedService.name}
                  </strong>

                  <span>
                    {selectedService.sellingPrice.toLocaleString()}
                    {" "}
                    Coins / 1K
                  </span>

                </div>

                <CheckCircle2
                  size={19}
                  className="selected-check"
                />

              </div>

            </div>


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
                Enter the Telegram username,
                channel, group or post link
                required by this service.
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

              <small>

                Minimum{" "}
                {selectedService.minQuantity.toLocaleString()}
                {" • "}
                Maximum{" "}
                {selectedService.maxQuantity.toLocaleString()}

              </small>

            </div>


            {/* =================================
                ORDER SUMMARY
            ================================= */}

            <div className="order-summary">

              <div className="summary-row">

                <span>
                  Quantity
                </span>

                <strong>
                  {quantityNumber > 0
                    ? quantityNumber.toLocaleString()
                    : "—"}
                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Rate
                </span>

                <strong>
                  {selectedService.sellingPrice.toLocaleString()}
                  {" "}
                  / 1K
                </strong>

              </div>


              <div className="summary-divider" />


              <div className="summary-row total">

                <span>
                  Estimated Cost
                </span>

                <strong>
                  {estimatedCost.toLocaleString()}
                  {" "}
                  Coins
                </strong>

              </div>


              {estimatedCost > 0 && (
                <div
                  className={
                    `balance-after ${
                      remainingBalance >= 0
                        ? "positive"
                        : "negative"
                    }`
                  }
                >

                  <span>
                    Balance after order
                  </span>

                  <strong>
                    {remainingBalance >= 0
                      ? remainingBalance.toLocaleString()
                      : "Insufficient Coins"}
                  </strong>

                </div>
              )}

            </div>


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
                quantityNumber <= 0
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


            {/* =================================
                NOTE
            ================================= */}

            <div className="order-note">

              <ShieldCheck size={15} />

              <span>
                Your Coins are deducted
                securely when the order is
                created. Orders are then
                processed by CoinEarn.
              </span>

            </div>

          </div>

        </section>
      )}

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Small balance icon
|--------------------------------------------------------------------------
*/

function CoinsIcon() {
  return (
    <span className="market-coins-icon">
      🪙
    </span>
  );
}

