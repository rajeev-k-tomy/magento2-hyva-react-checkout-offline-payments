import React, { useEffect, useCallback, useRef } from 'react';
import _get from 'lodash.get';
import { shape, func } from 'prop-types';

import Card from '../../../../../components/common/Card/Card';
import TextInput from '../../../../../components/common/Form/TextInput';
import RadioInput from '../../../../../components/common/Form/RadioInput';
import {
  useOfflineCheckoutFormContext,
  useOfflinePaymentMethodFormContext,
} from '../../hooks';
import { __ } from '../../../../../i18n';
import { poNumberField } from './utility';
import { usePurchaseOrderAppContext } from './hooks';
import { usePerformPlaceOrderByREST } from '../../../../../hook';
import { paymentMethodShape } from '../../../../../utils/payment';

function PurchaseOrder({ method, selected, actions }) {
  const poNumberFieldSetRef = useRef();
  const { setErrorMessage } = usePurchaseOrderAppContext();
  const { registerPaymentAction } = useOfflineCheckoutFormContext();
  const performPlaceOrder = usePerformPlaceOrderByREST(method.code);
  const { formikData, setFieldTouched } = useOfflinePaymentMethodFormContext();
  const isSelected = method.code === selected.code;

  const placeOrderWithPurchaseOrder = useCallback(
    async (values) => {
      const poNumber = _get(values, poNumberField);

      if (!poNumber) {
        setErrorMessage(__('Please provide your purchase order number.'));
        setFieldTouched(poNumberField);
        if (poNumberFieldSetRef.current) {
          const textInputDOM =
            poNumberFieldSetRef.current.querySelector('input[type="text"]');

          if (textInputDOM) {
            textInputDOM.focus();
          }
        }
        return;
      }
      await performPlaceOrder(values, {
        additionalData: null,
        extraPaymentData: { po_number: poNumber },
      });
    },
    [performPlaceOrder, setErrorMessage, poNumberFieldSetRef, setFieldTouched]
  );

  useEffect(() => {
    registerPaymentAction(method.code, placeOrderWithPurchaseOrder);
  }, [method, registerPaymentAction, placeOrderWithPurchaseOrder]);

  if (!isSelected) {
    return (
      <RadioInput
        value={method.code}
        label={method.title}
        name="paymentMethod"
        checked={isSelected}
        onChange={actions.change}
      />
    );
  }

  return (
    <div>
      <div>
        <RadioInput
          value={method.code}
          label={method.title}
          name="paymentMethod"
          checked={isSelected}
          onChange={actions.change}
        />
      </div>
      <div className="mx-4 my-4">
        <Card bg="darker">
          <div className="container flex flex-col justify-center w-4/5">
            <fieldset ref={poNumberFieldSetRef}>
              <label htmlFor={poNumberField} className="inline-block mb-2">
                {__('Purchase Order Number')}
              </label>
              <TextInput
                required
                id={poNumberField}
                name={poNumberField}
                formikData={formikData}
                title={__('Purchase Order Number')}
              />
            </fieldset>
          </div>
        </Card>
      </div>
    </div>
  );
}

PurchaseOrder.propTypes = {
  method: paymentMethodShape.isRequired,
  selected: paymentMethodShape.isRequired,
  actions: shape({ change: func }).isRequired,
};

export default PurchaseOrder;
