import React from "react";
import styled from "styled-components";

const Loader = () => {
    return (
        <StyledWrapper>
            <svg className="container">
                <rect className="boxes" />
            </svg>
        </StyledWrapper>
    );
};

const StyledWrapper = styled.div`
    .container {
        width: 50px;
        height: 50px;
    }

    .container .boxes {
        width: 50px;
        height: 50px;
        fill: none;
        stroke-width: 50px;
        stroke: #43cb85;
        stroke-dasharray: 50;
        stroke-dashoffset: 50%;
        animation: animate 2s linear infinite;
    }

    @keyframes animate {
        to {
            stroke-dashoffset: 250%;
        }
    }
`;

export default Loader;
