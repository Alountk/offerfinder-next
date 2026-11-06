import {render, screen} from '@testing-library/react'
import HomePage from './page'

describe('HomePage', () => {
  it('explains the exercise and what will be valued', () => {
    render(<HomePage />)

    expect(screen.getByRole('heading', {level: 1, name: /buscador de ofertas/i})).toBeInTheDocument()
    expect(screen.getByText(/arquitectura testeable y mantenible/i)).toBeInTheDocument()
    expect(screen.getByText(/funcionalidades server-side de Next.js/i)).toBeInTheDocument()
  })

  it('lists the 3 filters to implement', () => {
    render(<HomePage />)

    expect(screen.getByText('Texto libre')).toBeInTheDocument()
    expect(screen.getByText('Provincia')).toBeInTheDocument()
    expect(screen.getByText('Tipo de contrato')).toBeInTheDocument()
  })

  it('lists the extras that add points, including dockerizing for Kubernetes', () => {
    render(<HomePage />)

    expect(screen.getByRole('heading', {name: /extras que suman puntos/i})).toBeInTheDocument()
    expect(screen.getByText(/dockerizar la aplicación.*kubernetes/i)).toBeInTheDocument()
  })

  it('ends with the questions about client state management and caching', () => {
    render(<HomePage />)

    expect(screen.getByRole('heading', {name: /preguntas para resolver al final/i})).toBeInTheDocument()
    expect(screen.getByText(/gestionarías el estado en cliente/i)).toBeInTheDocument()
    expect(screen.getByText(/cachearías y dónde/i)).toBeInTheDocument()
  })

  it('requires Tailwind for the styles and offers design extras', () => {
    render(<HomePage />)

    expect(screen.getByRole('heading', {name: /estilos: usa tailwind/i})).toBeInTheDocument()
    expect(screen.getByText('Diseño y CSS')).toBeInTheDocument()
    expect(screen.getByText(/modo oscuro con prefers-color-scheme/i)).toBeInTheDocument()
  })
})
