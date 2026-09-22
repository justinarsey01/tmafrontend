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
} from "lucide-react";

import {
  getServices,
  createSmmOrder,
  type SmmService,
} from "../lib/api";


interface MarketProps {

  balance: number;

  setBalance:
  Dispatch<SetStateAction<number>>;

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

  const name =
    service.name.toLowerCase();


  if (
    name.includes("member")
  ) {

    return (
      <Users size={25} />
    );

  }


  if (
    name.includes("reaction")
  ) {

    return (
      <Heart size={25} />
    );

  }


  if (
    name.includes("view")
  ) {

    return (
      <Eye size={25} />
    );

  }


  return (
    <Send size={25} />
  );

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

  const [
    services,
    setServices,
  ] = useState<SmmService[]>([]);


  const [
    selectedServiceId,
    setSelectedServiceId,
  ] = useState<string>("");


  const [
    target,
    setTarget,
  ] = useState("");


  const [
    quantity,
    setQuantity,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    ordering,
    setOrdering,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  const [
    success,
    setSuccess,
  ] = useState<string | null>(
    null
  );


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


        if (
          result.length > 0
        ) {

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
  | Quantity number
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
          (
            quantityNumber *
            selectedService.sellingPrice
          ) / 1000
        )

      : 0;


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


      setBalance(
        order.balance
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
              Spend your Coins on Telegram services.
            </p>

          </div>

          <div className="market-header-icon">
            <ShoppingBag size={24} />
          </div>

        </div>


        <div className="market-loading">

          <Loader2
            size={28}
            className="spin"
          />

          <p>
            Loading services...
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

      {/* HEADER */}

      <div className="market-header">

        <div>

          <p className="page-eyebrow">
            COINEARN MARKET
          </p>

          <h1>
            Market
          </h1>

          <p>
            Spend your Coins on Telegram services.
          </p>

        </div>


        <div className="market-header-icon">

          <ShoppingBag size={24} />

        </div>

      </div>


      {/* BALANCE */}

      <div className="market-balance-card">

        <div>

          <span>
            Available Balance
          </span>

          <strong>
            {balance.toLocaleString()}
          </strong>

          <small>
            Coins
          </small>

        </div>


        <div className="balance-coin">
          🪙
        </div>

      </div>


      {/* ERROR */}

      {error && (

        <div className="market-message error">

          <AlertCircle size={19} />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* SUCCESS */}

      {success && (

        <div className="market-message success">

          <CheckCircle2 size={19} />

          <span>
            {success}
          </span>

        </div>

      )}


      {/* SERVICES */}

      <section className="market-section">

        <div className="section-title">

          <h2>
            Telegram Services
          </h2>

          <span>
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
                  key={service.id}
                  className={
                    `service-card ${
                      selected
                        ? "selected"
                        : ""
                    }`
                  }
                  onClick={() => {

                    setSelectedServiceId(
                      service.id
                    );

                    setError(null);

                    setSuccess(null);

                  }}
                >

                  <div className="service-icon">

                    <ServiceIcon
                      service={service}
                    />

                  </div>


                  <div className="service-info">

                    <strong>
                      {service.name}
                    </strong>

                    <p>
                      {service.description}
                    </p>

                    <span>
                      {service.sellingPrice.toLocaleString()}
                      {" "}Coins / 1K
                    </span>

                  </div>

                </button>

              );

            }
          )}

        </div>

      </section>


      {/* ORDER FORM */}

      {selectedService && (

        <section className="market-section">

          <div className="section-title">

            <h2>
              Create Order
            </h2>

          </div>


          <div className="order-form">

            {/* SERVICE */}

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


                <div>

                  <strong>
                    {selectedService.name}
                  </strong>

                  <span>
                    {selectedService.sellingPrice.toLocaleString()}
                    {" "}Coins / 1K
                  </span>

                </div>

              </div>

            </div>


            {/* TARGET */}

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
                required by the service.
              </small>

            </div>


            {/* QUANTITY */}

            <div className="form-group">

              <label>
                Quantity
              </label>

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

              <small>

                Min:
                {" "}
                {selectedService.minQuantity.toLocaleString()}

                {" • "}

                Max:
                {" "}
                {selectedService.maxQuantity.toLocaleString()}

              </small>

            </div>


            {/* COST */}

            <div className="order-summary">

              <div>

                <span>
                  Quantity
                </span>

                <strong>
                  {quantityNumber > 0
                    ? quantityNumber.toLocaleString()
                    : "—"}
                </strong>

              </div>


              <div>

                <span>
                  Estimated Cost
                </span>

                <strong className="summary-cost">

                  {estimatedCost.toLocaleString()}

                  {" "}

                  Coins

                </strong>

              </div>

            </div>


            {/* BUTTON */}

            <button
              className="place-order-button"
              onClick={handleOrder}
              disabled={
                ordering ||
                !selectedService
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

                </>

              )}

            </button>


            <p className="order-note">

              Your Coins will be deducted
              immediately when the order
              is created. The order will
              then be processed by CoinEarn.

            </p>

          </div>

        </section>

      )}

    </div>

  );

}