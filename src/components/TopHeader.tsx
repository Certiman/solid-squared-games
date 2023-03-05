import { Component } from "solid-js";
import { Navbar, Offcanvas, Container, NavDropdown, Nav } from 'solid-bootstrap'

const TopHeader: Component<{}> = (props) => {
  
  return (
    <Navbar bg='light' expand={false}>
      <Container fluid>
        <Navbar.Brand href='#'>SolidJS - Squared Games Solver</Navbar.Brand>
        <Navbar.Toggle aria-controls='offcanvasNavbar' />
        <Navbar.Offcanvas
          id='offcanvasNavbar'
          aria-labelledby='offcanvasNavbarLabel'
          placement='end'
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id='offcanvasNavbarLabel'>
              💟 Game Solver ✅
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav class='justify-content-end flex-grow-1 pe-3'>
              <Nav.Link href='/'>Home</Nav.Link>
              <Nav.Link href='/about'>About</Nav.Link>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  )
};

export default TopHeader;