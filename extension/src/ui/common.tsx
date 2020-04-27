import styled from 'styled-components';

export const Title = styled.div`
  font-weight: bold;
  padding-bottom: 5px;
  font-size: 12px;
`;

export const Table = styled.table`
  border-collapse: collapse;
  th,
  td {
    padding-right: 10px;
    &:last-child {
      padding-right: 0;
    }
  }
`;

export const HoverTD = styled.td`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

export const Stock = styled.div`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
