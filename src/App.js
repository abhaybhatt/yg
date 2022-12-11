import React, { useState, useEffect } from 'react'
import { checkNewUser, makeBooking, addUser } from './api';
import Table from 'rc-table';
import Select from 'react-select';
import { TailSpin } from 'react-loader-spinner'
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]
const batches = [
  { value: 1, label: '6-7AM' },
  { value: 2, label: '7-8AM' },
  { value: 3, label: '8-9AM' },
  { value: 4, label: '5-6PM' },
]

const RadioLoader = () => {
  return (
    <TailSpin
      height="20"
      width="20"
      color="#ffffff"
      ariaLabel="tail-spin-loading"
      radius="1"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
    />
  )
}

const App = () => {
  const [email, setEmail] = useState('')
  const [step, newStep] = useState(0)
  const [newUser, setNewUser] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [age, setAge] = useState(0)
  const [lastName, setLastName] = useState('')
  const [userData, setUserData] = useState({})
  const [month, setMonth] = useState(1)
  const [year, setYear] = useState(2023)
  const [batch, setBatch] = useState(1)
  const [previousBookings, setPreviousBookings] = useState([])
  const [loading, setLoading] = useState(false)

  const checkEmail = async () => {
    setLoading(true)
    const data = await checkNewUser(email)
    setNewUser(data.newUser)
    setUserData(data.data)
    if (data.newUser === false) {
      setPreviousBookings(data.data.bookings)
      setFirstName(data.data.firstName)
      setLastName(data.data.lastName)
      setAge(data.data.age)
    }
    setLoading(false)
    newStep(step + 1)
  }

  const bookSLot = async () => {
    const data = await makeBooking({ month: month, year: parseInt(year), batch: batch, user_id: userData.id })
    if (data.status === 'pass') {
      setPreviousBookings([...previousBookings, data.data])
    }
  }

  const makePayment = async () => {
    setLoading(true)
    if (parseInt(year) < parseInt(new Date().getFullYear())) {
      toast.error("invalid year")
      setLoading(false)
      return
    }

    if (parseInt(year) === parseInt(new Date().getFullYear()) && parseInt(month) < parseInt(new Date().getMonth() + 1)) {
      toast.error("inavlid month")
      setLoading(false)
      return
    }
    let id = ''
    if (newUser === true) {
      const obj = {
        firstName: firstName,
        lastName: lastName,
        age: age,
        email: email
      }
      if (firstName === '') {
        toast.error('First name is missing')
        setLoading(false)
        return
      }
      if (age < 18 || age > 65) {
        toast.error('age must be between 18 and 65')
        setLoading(false)
        return
      }
      const data = await addUser(obj)
      if (data.created === true) {
        id = data.data.id
        setUserData(data.data)
        setNewUser(false)
        setPreviousBookings([])
      }
    }
    const data = await makeBooking({ month: month, year: parseInt(year), batch: batch, user_id: id === '' ? userData.id : id })
    if (data.status === 'pass') {
      setPreviousBookings([...previousBookings, data.data])
    } else if (data.status === "fail" && data.data === "You have already booked this slot once") {
      toast.error(data.data)
    }
    setLoading(false)
  }
  const generateTable = () => {
    if (previousBookings && previousBookings.length > 0) {
      const data = previousBookings.map((booking) => {
        const obj = {
          Batch: batches[booking.batch - 1].label,
          Month: months[booking.month - 1].label,
          Year: booking.year
        }
        return obj
      })

      const columns = [
        {
          title: 'Batch',
          dataIndex: 'Batch',
          key: 'Batch',
          width: 200,
          align: 'center'
        },
        {
          title: 'Month',
          dataIndex: 'Month',
          key: 'Month',
          width: 200,
          align: 'center'
        },
        {
          title: 'Year',
          dataIndex: 'Year',
          key: 'Year',
          width: 200,
          align: 'center'
        },
      ];

      return (
        <Table columns={columns} data={data} />
      )
    } else {
      return (
        <div>No previous bookings found</div>
      )
    }
  }
  const renderSecondStep = () => {
    return (
      <div className='main'>
        <div className='sub'>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>First Name</label>
            <input className='input' onChange={(e) => setFirstName(e.target.value)} value={firstName} readOnly={!newUser} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Last Name</label>
            <input className='input' onChange={(e) => setLastName(e.target.value)} value={lastName} readOnly={!newUser} />
          </div>

        </div>
        <div className='sub'>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Email</label>
            <input className='input' value={email} readOnly />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Age</label>
            <input className='input' onChange={(e) => setAge(e.target.value)} value={age} readOnly={!newUser} />
          </div>

        </div>

        <div className='sub'>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Month</label>
            <Select
              className="basic-single"
              classNamePrefix="select"
              defaultValue={months[0]}
              isSearchable={true}
              name="color"
              options={months}
              onChange={(option) => setMonth(option.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Year</label>
            <input className='input' type={"number"} onChange={(e) => setYear(e.target.value)} value={year} />
          </div>
        </div>
        <div className='sub'>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Batch</label>
            <Select
              className="basic-single"
              classNamePrefix="select"
              defaultValue={batches[0]}
              isSearchable={true}
              name="color"
              options={batches}
              onChange={(option) => setBatch(option.value)}
            />
          </div>
        </div>
        <button className='button' onClick={() => makePayment()}>{loading ? <RadioLoader /> : 'Make payment'}</button>
      </div>
    )
  }
  return (
    <div className='main'>
      <Toaster />
      {step === 0 && (
        <>
          <input className='input' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Enter Email' />
          <button className='button' onClick={() => {
            checkEmail()
          }}>{loading ? <RadioLoader /> : 'Continue'}</button>
        </>
      )}
      {
        step === 1 && renderSecondStep()
      }
      {step !== 0 && (
        <div>
          <h1>Previous bookings by you</h1>
          <div>{generateTable()}</div>
        </div>
      )}
    </div>
  )
}


export default App;
