// const url = 'http://localhost:8000';
const url = 'https://sql-yg3.onrender.com'
export const checkNewUser = async (email) => {
    const apiData = await fetch(`${url}/checkUser/${email}`).then(res => res.json()).then(data => {
        return data
    })
    return apiData
}

export const addUser = async (data) => {
    const apiData = await fetch(`${url}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(data => {
        return data
    })
    return apiData
}



export const makeBooking = async (data) => {
    const apiData = await fetch(`${url}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(data => {
        return data
    })
    return apiData
}