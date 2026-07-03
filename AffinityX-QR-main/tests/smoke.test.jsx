import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../src/pages/Login'

describe('Login page', () => {
  it('renders the welcome heading', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
  })

  it('offers Google sign-in', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument()
  })
})
