import { supabase } from '../supabaseClient'

// Bank of Georgia API integration
const processBankOfGeorgiaPayment = async (paymentData) => {
  try {
    // Validate IBAN
    if (!paymentData.iban || !/^GE\d{2}[A-Z]{2}\d{16}$/.test(paymentData.iban)) {
      throw new Error('Invalid IBAN format')
    }

    const response = await fetch('https://api.bog.ge/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_BOG_API_KEY}`
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        currency: paymentData.currency || 'GEL',
        description: 'ANSA E-commerce Purchase',
        callback_url: `${window.location.origin}/payment-callback`,
        destination: {
          iban: paymentData.iban,
          name: paymentData.destination_name || 'ANSA E-commerce'
        },
        merchant_data: {
          order_id: paymentData.order_id,
          customer_id: paymentData.customer_id
        }
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Bank of Georgia payment failed')
    }
    
    const data = await response.json()
    
    // Save payment attempt to Supabase
    await supabase.from('payments').insert([{
      payment_id: data.transaction_id,
      amount: paymentData.amount,
      currency: paymentData.currency || 'GEL',
      method: 'bog',
      status: 'pending',
      order_id: paymentData.order_id,
      destination: paymentData.iban
    }])

    return data
  } catch (error) {
    console.error('Bank of Georgia payment error:', error)
    throw error
  }
}

// TBC Bank API integration
const processTBCPayment = async (paymentData) => {
  try {
    // Validate IBAN
    if (!paymentData.iban || !/^GE\d{2}[A-Z]{2}\d{16}$/.test(paymentData.iban)) {
      throw new Error('Invalid IBAN format')
    }

    const response = await fetch('https://api.tbcbank.ge/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_TBC_API_KEY}`
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        currency: paymentData.currency || 'GEL',
        description: 'ANSA E-commerce Purchase',
        return_url: `${window.location.origin}/payment-callback`,
        destination: {
          iban: paymentData.iban,
          name: paymentData.destination_name || 'ANSA E-commerce'
        },
        order_id: paymentData.order_id,
        customer_id: paymentData.customer_id
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'TBC payment failed')
    }
    
    const data = await response.json()

    // Save payment attempt to Supabase
    await supabase.from('payments').insert([{
      payment_id: data.transaction_id,
      amount: paymentData.amount,
      currency: paymentData.currency || 'GEL',
      method: 'tbc',
      status: 'pending',
      order_id: paymentData.order_id,
      destination: paymentData.iban
    }])

    return data
  } catch (error) {
    console.error('TBC payment error:', error)
    throw error
  }
}

// Apple Pay integration
const processApplePay = async (paymentData) => {
  try {
    if (!window.ApplePaySession) {
      throw new Error('Apple Pay not supported')
    }

    const session = new ApplePaySession(3, {
      countryCode: 'GE',
      currencyCode: paymentData.currency || 'GEL',
      supportedNetworks: ['visa', 'masterCard'],
      merchantCapabilities: ['supports3DS'],
      total: {
        label: 'ANSA E-commerce',
        amount: paymentData.amount
      }
    })

    session.onvalidatemerchant = async (event) => {
      const validationURL = event.validationURL
      const merchantSession = await fetch('/api/apple-pay-validate', {
        method: 'POST',
        body: JSON.stringify({ validationURL })
      })
      session.completeMerchantValidation(await merchantSession.json())
    }

    session.onpaymentauthorized = async (event) => {
      const payment = event.payment
      
      // Save payment attempt to Supabase
      await supabase.from('payments').insert([{
        payment_id: payment.token.transactionIdentifier,
        amount: paymentData.amount,
        currency: paymentData.currency || 'GEL',
        method: 'apple',
        status: 'pending',
        order_id: paymentData.order_id,
        destination: payment.token.paymentData
      }])

      session.completePayment('success')
      return { status: 'success' }
    }

    session.begin()
  } catch (error) {
    console.error('Apple Pay error:', error)
    throw error
  }
}

// Google Pay integration
const processGooglePay = async (paymentData) => {
  try {
    if (!window.PaymentRequest) {
      throw new Error('Google Pay not supported')
    }

    const paymentRequest = new PaymentRequest(
      {
        supportedMethods: 'https://google.com/pay',
        data: {
          environment: 'PRODUCTION',
          apiVersion: 2,
          apiVersionMinor: 0,
          merchantInfo: {
            merchantId: process.env.VITE_GOOGLE_MERCHANT_ID,
            merchantName: 'ANSA E-commerce'
          },
          allowedPaymentMethods: [
            {
              type: 'CARD',
              parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['VISA', 'MASTERCARD']
              }
            }
          ]
        }
      },
      {
        total: {
          label: 'Total',
          amount: {
            currency: paymentData.currency || 'GEL',
            value: paymentData.amount
          }
        }
      }
    )

    const paymentResponse = await paymentRequest.show()
    
    // Save payment attempt to Supabase
    await supabase.from('payments').insert([{
      payment_id: paymentResponse.details.paymentToken,
      amount: paymentData.amount,
      currency: paymentData.currency || 'GEL',
      method: 'google',
      status: 'pending',
      order_id: paymentData.order_id,
      destination: paymentResponse.details.paymentMethodData
    }])

    await paymentResponse.complete('success')
    return { status: 'success' }
  } catch (error) {
    console.error('Google Pay error:', error)
    throw error
  }
}

// Unified payment processor
export const processPayment = async (paymentData, method) => {
  try {
    let result
    switch (method) {
      case 'bog':
        result = await processBankOfGeorgiaPayment(paymentData)
        break
      case 'tbc':
        result = await processTBCPayment(paymentData)
        break
      case 'apple':
        result = await processApplePay(paymentData)
        break
      case 'google':
        result = await processGooglePay(paymentData)
        break
      default:
        throw new Error('Invalid payment method')
    }

    return { status: 'success', data: result }
  } catch (error) {
    await supabase.from('payments').insert([{
      payment_id: null,
      amount: paymentData.amount,
      currency: paymentData.currency || 'GEL',
      method,
      status: 'failed',
      error: error.message,
      order_id: paymentData.order_id,
      destination: paymentData.iban || null
    }])
    return { status: 'error', error: error.message }
  }
}
