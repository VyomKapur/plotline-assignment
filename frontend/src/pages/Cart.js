import { useShoppingCart } from "../context/ShoppingCartContext"
import Invoice from '../components/Invoice'
import { Container, Button, Spinner } from 'react-bootstrap'
import { useAuthContext } from "../context/AuthContext"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
const Cart = () => {
    const { clearCart, cartItems } = useShoppingCart()
    const { user } = useAuthContext()
    const [items, setItems] = useState(cartItems)
    const [isLoading, setIsLoading] = useState(true)
    let grandTotal = 0
    try{
        grandTotal = items.reduce((accumulator, item) => accumulator + (item.quantity * item.price) + item.tax, 0)
    } catch(error){
        console.log(error)
    }
    const navigate = useNavigate()

    useEffect(() => {
        const getStatement = async() => {
            console.log(items)
            const response = await fetch('https://backend-zeta-roan.vercel.app/calculatetax', {
                method: 'POST',
                body: JSON.stringify(items),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })
            const json = await response.json()
            console.log(response)
            if(response.ok){
                setItems(json)
                console.log(items)
            }
        }
        if(user){
            getStatement()
            setIsLoading(false)
        }
    }, [user])
    const handleClearCart = () => {
        setItems([])
        clearCart()
    }
    const handleCheckout = (e) =>{
        e.preventDefault()
        const payload = { user_email: user.email, items: items, totalPrice: grandTotal}
        console.log(payload)
        const createOrder = async() => {
            const response = await fetch('https://backend-zeta-roan.vercel.app/orders/place', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })
            const json = await response.json()
            console.log(response)
            if(response.ok){
                setItems(json)
                console.log(items)
            }
        }
        createOrder()
        handleClearCart()
        navigate('/orders',{replace: true})
    }
    return (
        <>
        {isLoading && (
            <Spinner animation="border" />
        )}
        {user && (
            <Container className="mt-5">
            {items.length > 0 ? (<Invoice items={ items } grandTotal={ grandTotal }/>):
            (
                <h1>No Items in cart!</h1>
            )}
            {cartItems.length > 0 && (
            <div>
            <Button onClick={handleClearCart} style={{margin: '10px', backgroundColor:'#b1454a', border: 'none'}}>Clear Cart</Button>
            <Button onClick={handleCheckout} style={{margin: '10px', backgroundColor:'#b1454a', border: 'none'}}>Checkout</Button>
            </div>
            )}
            </Container>
        )}
        </>
    )
}

export default Cart