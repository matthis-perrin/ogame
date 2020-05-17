import styled from 'styled-components';

import {COLOR_GREEN} from '@src/models/constants';

export const Title = styled.div`
  font-weight: bold;
  padding-bottom: 5px;
  font-size: 12px;
`;

export const Table = styled.table`
  border-collapse: collapse;
  th,
  td {
    vertical-align: top;
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
  &.green {
    color: ${COLOR_GREEN};
  }
`;

export const Stock = styled.div`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

export const EmptyLine = styled.td`
  height: 10px;
`;
