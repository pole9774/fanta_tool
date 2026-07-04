import { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import API from "../API/API";

function AstaDetails(props: any) {

    const { asta_id } = useParams();

    return (
        <h1>Asta ID: {asta_id}</h1>
    );
}

export default AstaDetails;
